import { useState, useEffect } from 'react';
import {
  Tag, Button, Modal, Form, Input, Select,
  DatePicker, message, Popconfirm, Space, Badge,
  Tabs, Tooltip, Spin
} from 'antd';
import {
  RiProductHuntLine, RiAddLine, RiFileList2Line, 
  RiSearchLine, RiFilterLine, RiCloseLine, 
  RiCheckLine, RiTimerLine, RiUserLine, 
  RiRefreshLine, RiDownloadLine, RiArchiveLine
} from 'react-icons/ri';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

export default function ProductSpecificationsPage() {
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSpec, setCurrentSpec] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/product-specifications');
        if (!response.ok) throw new Error('Failed to fetch specifications');
        const data = await response.json();
        setSpecifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSpecs = specifications.filter(spec => {
    const matchesSearch = spec.u_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.u_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.u_external_id?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'active') {
      matchesTab = dayjs().isBefore(dayjs(spec.u_valid_to)) && 
                  dayjs().isAfter(dayjs(spec.u_valid_from));
    } else if (activeTab === 'expired') {
      matchesTab = dayjs().isAfter(dayjs(spec.u_valid_to));
    } else if (activeTab === 'upcoming') {
      matchesTab = dayjs().isBefore(dayjs(spec.u_valid_from));
    }

    return matchesSearch && matchesTab;
  });

  const handleCreate = () => {
    setCurrentSpec(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (spec) => {
    setCurrentSpec(spec);
    form.setFieldsValue({
      ...spec,
      u_valid_from: spec.u_valid_from ? dayjs(spec.u_valid_from) : null,
      u_valid_to: spec.u_valid_to ? dayjs(spec.u_valid_to) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/product-specifications/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      setSpecifications(specifications.filter(spec => spec.sys_id !== id));
      message.success('Specification deleted successfully');
    } catch (err) {
      message.error('Failed to delete specification');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const specData = {
        ...values,
        u_valid_from: values.u_valid_from ? values.u_valid_from.format('YYYY-MM-DD HH:mm:ss') : null,
        u_valid_to: values.u_valid_to ? values.u_valid_to.format('YYYY-MM-DD HH:mm:ss') : null
      };

      const url = currentSpec 
        ? `http://localhost:3000/product-specifications/${currentSpec.sys_id}`
        : 'http://localhost:3000/product-specifications';
      const method = currentSpec ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specData)
      });

      if (!response.ok) throw new Error('Operation failed');
      message.success(`Specification ${currentSpec ? 'updated' : 'created'} successfully`);
      setIsModalVisible(false);
      
      // Refresh data
      const refreshResponse = await fetch('http://localhost:3000/product-specifications');
      const data = await refreshResponse.json();
      setSpecifications(data);
    } catch (err) {
      message.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-500 text-red-300 p-4 mx-6 mt-6 rounded">
        <p className="font-bold">Error Loading Data</p>
        <p>{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
          icon={<RiRefreshLine />}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#1F2937] min-h-screen text-gray-200">
      {/* Page Header */}
      <div className="border-b border-[#374151] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <RiProductHuntLine className="text-blue-400 mr-2" />
              Product Specifications
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage all product specifications
            </p>
          </div>
          <Button
            type="primary"
            icon={<RiAddLine />}
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 border-none"
          >
            Add Specification
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="product-tabs"
            items={[
              {
                key: 'all',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>All Specifications</span>
                    <Badge count={specifications.length} className="ml-2 bg-[#374151] text-gray-200" />
                  </div>
                )
              },
              {
                key: 'active',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Active</span>
                    <Badge 
                      count={specifications.filter(spec => 
                        dayjs().isBefore(dayjs(spec.u_valid_to)) && 
                        dayjs().isAfter(dayjs(spec.u_valid_from))
                      ).length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              },
              {
                key: 'expired',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Expired</span>
                    <Badge 
                      count={specifications.filter(spec => 
                        dayjs().isAfter(dayjs(spec.u_valid_to))
                      ).length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              },
              {
                key: 'upcoming',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Upcoming</span>
                    <Badge 
                      count={specifications.filter(spec => 
                        dayjs().isBefore(dayjs(spec.u_valid_from))
                      ).length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              }
            ]}
          />

          <div className="flex items-center space-x-3">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search specifications..."
                className="bg-[#111827] border border-[#374151] rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 text-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              icon={<RiFilterLine />}
              className="bg-[#111827] border border-[#374151] hover:bg-[#1a2231] text-gray-300"
            >
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="px-6 py-6">
        {filteredSpecs.length === 0 ? (
          <div className="bg-[#111827] rounded-lg border border-[#374151] p-8 text-center">
            <RiFileList2Line className="mx-auto text-4xl text-gray-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-300">No specifications found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? 'Try adjusting your search query' : 'No specifications available'}
            </p>
            <Button
              type="primary"
              onClick={handleCreate}
              className="mt-4 bg-blue-600 hover:bg-blue-700 border-none"
              icon={<RiAddLine />}
            >
              Create Specification
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpecs.map((spec) => {
              const createdBy = { name: spec.sys_created_by || 'System' };
              const updatedBy = { name: spec.sys_updated_by || 'System' };
              
              return (
                <div 
                  key={spec.sys_id} 
                  className="bg-[#111827] rounded-lg border border-[#374151] overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  {/* Specification Image */}
                  <div className="h-48 bg-[#1a2231] flex items-center justify-center relative">
                    <div className="text-gray-500 text-center p-4">
                      <RiProductHuntLine className="text-4xl mb-2 mx-auto" />
                      <p>No image available</p>
                    </div>
                    
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      {dayjs().isBefore(dayjs(spec.u_valid_from)) && (
                        <Tag color="blue" className="flex items-center">
                          <RiTimerLine className="mr-1" /> Upcoming
                        </Tag>
                      )}
                      {dayjs().isAfter(dayjs(spec.u_valid_to)) && (
                        <Tag color="red" className="flex items-center">
                          <RiArchiveLine className="mr-1" /> Expired
                        </Tag>
                      )}
                      {dayjs().isBefore(dayjs(spec.u_valid_to)) && dayjs().isAfter(dayjs(spec.u_valid_from)) && (
                        <Tag color="green" className="flex items-center">
                          <RiCheckLine className="mr-1" /> Active
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* Specification Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-lg font-semibold text-gray-100 line-clamp-1">
                        {spec.u_name}
                      </div>
                      <div className="text-sm font-bold text-gray-100">
                        v{spec.u_version}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {spec.u_description || 'No description available'}
                    </p>

                    <div className="mb-3">
                      <div className="flex items-center text-xs text-gray-400 mb-1">
                        <span className="font-medium">External ID:</span>
                        <span className="ml-1">{spec.u_external_id || 'N/A'}</span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-3">
                      <div className="flex items-center text-xs text-gray-400 mb-1">
                        <RiUserLine className="mr-1" />
                        <span>Created by: {createdBy.name}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <RiUserLine className="mr-1" />
                        <span>Updated by: {updatedBy.name}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="border-t border-[#374151] pt-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <div>
                          <span className="block">Valid From:</span>
                          <span className="text-gray-300">
                            {dayjs(spec.u_valid_from).format('MMM D, YYYY')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block">Valid To:</span>
                          <span className="text-gray-300">
                            {dayjs(spec.u_valid_to).format('MMM D, YYYY')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="px-4 py-3 border-t border-[#374151] bg-[#1a2231] hidden group-hover:block">
                    <div className="flex justify-between">
                      <Space>
                        <Tooltip title="Edit">
                          <Button 
                            type="text" 
                            icon={<span className="text-blue-400">✏️</span>}
                            onClick={() => handleEdit(spec)}
                            className="hover:bg-blue-500/10"
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Delete this specification?"
                          onConfirm={() => handleDelete(spec.sys_id)}
                          okText="Delete"
                          cancelText="Cancel"
                          overlayClassName="bg-[#111827] border border-[#374151]"
                        >
                          <Tooltip title="Delete">
                            <Button 
                              type="text" 
                              icon={<span className="text-red-400">🗑️</span>}
                              className="hover:bg-red-500/10"
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                      <Space>
                        <Tooltip title="Export">
                          <Button 
                            type="text" 
                            icon={<RiDownloadLine className="text-gray-400" />}
                            className="hover:bg-gray-500/10"
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        title={<span className="text-gray-200">{currentSpec ? 'Edit Specification' : 'Create New Specification'}</span>}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={currentSpec ? 'Update' : 'Create'}
        cancelText="Cancel"
        className="[&_.ant-modal-content]:bg-[#111827] [&_.ant-modal-header]:bg-[#111827] [&_.ant-modal-title]:text-gray-200 [&_.ant-modal-close]:text-gray-400"
        okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-700 border-none' }}
        cancelButtonProps={{ className: 'bg-[#1F2937] border-[#374151] text-gray-300 hover:text-gray-200' }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6 [&_label]:text-gray-300 [&_.ant-input]:bg-[#1F2937] [&_.ant-input]:border-[#374151] [&_.ant-input]:text-gray-200 [&_.ant-select-selector]:bg-[#1F2937] [&_.ant-select-selector]:border-[#374151] [&_.ant-select-selection-item]:text-gray-200 [&_.ant-picker]:bg-[#1F2937] [&_.ant-picker]:border-[#374151] [&_.ant-picker-input_input]:text-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="u_name"
              label="Name"
              rules={[{ required: true, message: 'Please input specification name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="u_version"
              label="Version"
              initialValue="1.0"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="u_external_id"
              label="External ID"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="u_valid_from"
              label="Valid From"
              rules={[{ required: true }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
            </Form.Item>

            <Form.Item
              name="u_valid_to"
              label="Valid To"
              rules={[{ required: true }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            name="u_description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}