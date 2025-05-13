import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, Tag, Button, Modal, Form, Input, Select,
  DatePicker, message, Popconfirm, Space, Badge,
  Tabs, Tooltip, Spin
} from 'antd';
import {
  RiProductHuntLine, RiAddLine, RiEditLine,
  RiDeleteBinLine, RiFileList2Line, RiSearchLine,
  RiFilterLine, RiCloseLine, RiCheckLine, RiTimerLine,
  RiUserLine, RiRefreshLine, RiDownloadLine, RiArchiveLine
} from 'react-icons/ri';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

export default function ManageOfferingsPage() {
  const [products, setProducts] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState({
    products: true,
    specs: true,
    users: true
  });
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product offerings
        const productsResponse = await fetch('http://localhost:3000/product-offerings');
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch product specifications
        const specsResponse = await fetch('http://localhost:3000/product-specifications');
        if (!specsResponse.ok) throw new Error('Failed to fetch specifications');
        const specsData = await specsResponse.json();
        setSpecifications(specsData);

        try {
          // Attempt to fetch users but don't fail if this doesn't work
          const usersResponse = await fetch('http://localhost:3000/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const usersMap = {};
            usersData.forEach(user => {
              usersMap[user.sys_id] = user;
            });
            setUsers(usersMap);
          }
        } catch (usersError) {
          console.warn('Failed to fetch users:', usersError);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading({ products: false, specs: false, users: false });
      }
    };

    fetchData();
  }, []);

  const getSpecificationById = (sysId) => {
    return specifications.find(spec => spec.sys_id === sysId) || {};
  };

  const getUserById = (sysId) => {
    return users[sysId] || { name: sysId ? 'User ' + sysId.substring(0, 4) : 'System', email: '' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.u_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.u_description?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'draft') matchesTab = product.u_status === 'draft';
    else if (activeTab === 'inactive') matchesTab = product.u_status === 'inactive';
    else if (activeTab === 'pending') matchesTab = product.u_status === 'pending';
    else if (activeTab === 'active') matchesTab = product.u_status === 'active';
    else if (activeTab === 'archived') matchesTab = product.u_status === 'archived';

    return matchesSearch && matchesTab;
  });

  const handleCreate = () => {
    setCurrentProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    form.setFieldsValue({
      ...product,
      u_valid_from: product.u_valid_from ? dayjs(product.u_valid_from) : null,
      u_valid_to: product.u_valid_to ? dayjs(product.u_valid_to) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/product-offerings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      setProducts(products.filter(product => product.sys_id !== id));
      message.success('Product deleted successfully');
    } catch (err) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const productData = {
        ...values,
        u_valid_from: values.u_valid_from ? values.u_valid_from.format('YYYY-MM-DD HH:mm:ss') : null,
        u_valid_to: values.u_valid_to ? values.u_valid_to.format('YYYY-MM-DD HH:mm:ss') : null
      };

      const url = currentProduct 
        ? `http://localhost:3000/product-offerings/${currentProduct.sys_id}`
        : 'http://localhost:3000/product-offerings';
      const method = currentProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('Operation failed');
      message.success(`Product ${currentProduct ? 'updated' : 'created'} successfully`);
      setIsModalVisible(false);
      // Refresh data
      const refreshResponse = await fetch('http://localhost:3000/product-offerings');
      const data = await refreshResponse.json();
      setProducts(data);
    } catch (err) {
      message.error(err.message);
    }
  };

  if (loading.products || loading.specs) {
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
              Manage Offerings
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage all product offerings
            </p>
          </div>
          <Button
            type="primary"
            icon={<RiAddLine />}
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 border-none"
          >
            Add Product
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
                    <span>All Products</span>
                    <Badge count={products.length} className="ml-2 bg-[#374151] text-gray-200" />
                  </div>
                )
              },
              {
                key: 'draft',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Draft</span>
                    <Badge 
                      count={products.filter(p => p.u_status === 'draft').length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              },
              {
                key: 'active',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Active</span>
                    <Badge 
                      count={products.filter(p => p.u_status === 'active').length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              },
              {
                key: 'inactive',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Inactive</span>
                    <Badge 
                      count={products.filter(p => p.u_status === 'inactive').length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              },
              {
                key: 'pending',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Pending</span>
                    <Badge 
                      count={products.filter(p => p.u_status === 'pending').length} 
                      className="ml-2 bg-[#374151] text-gray-200"
                    />
                  </div>
                )
              },
              {
                key: 'archived',
                label: (
                  <div className="flex items-center px-3 text-gray-200">
                    <span>Archived</span>
                    <Badge 
                      count={products.filter(p => p.u_status === 'archived').length} 
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
                placeholder="Search products..."
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

      {/* Product Grid */}
      <div className="px-6 py-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-[#111827] rounded-lg border border-[#374151] p-8 text-center">
            <RiFileList2Line className="mx-auto text-4xl text-gray-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-300">No products found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? 'Try adjusting your search query' : 'No products available'}
            </p>
            <Button
              type="primary"
              onClick={handleCreate}
              className="mt-4 bg-blue-600 hover:bg-blue-700 border-none"
              icon={<RiAddLine />}
            >
              Create Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const spec = getSpecificationById(product.u_product_specification);
              const createdBy = getUserById(product.sys_created_by);
              const updatedBy = getUserById(product.sys_updated_by);
              
              return (
                <div 
                  key={product.sys_id} 
                  className="bg-[#111827] rounded-lg border border-[#374151] overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-[#1a2231] flex items-center justify-center relative">
                    {product.u_image_url ? (
                      <img 
                        src={product.u_image_url} 
                        alt={product.u_name} 
                        className="h-full w-full object-contain p-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 text-center p-4">
                        <RiProductHuntLine className="text-4xl mb-2 mx-auto" />
                        <p>No image available</p>
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      {product.u_status === 'draft' && (
                        <Tag color="orange" className="flex items-center">
                          <RiEditLine className="mr-1" /> Draft
                        </Tag>
                      )}
                      {product.u_status === 'active' && (
                        <Tag color="green" className="flex items-center">
                          <RiCheckLine className="mr-1" /> Active
                        </Tag>
                      )}
                      {product.u_status === 'inactive' && (
                        <Tag color="gray" className="flex items-center">
                          <RiCloseLine className="mr-1" /> Inactive
                        </Tag>
                      )}
                      {product.u_status === 'pending' && (
                        <Tag color="blue" className="flex items-center">
                          <RiTimerLine className="mr-1" /> Pending
                        </Tag>
                      )}
                      {product.u_status === 'archived' && (
                        <Tag color="red" className="flex items-center">
                          <RiArchiveLine className="mr-1" /> Archived
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Link 
                        to={`/product-manager/products/${product.sys_id}`}
                        className="text-lg font-semibold text-gray-100 hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {product.u_name}
                      </Link>
                      <div className="text-lg font-bold text-gray-100">
                        ${product.u_price}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.u_description || 'No description available'}
                    </p>

                    {/* Specification Info */}
                    {spec.sys_id && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-400 mb-1">
                          <RiFileList2Line className="mr-2" />
                          <span className="font-medium">Specification:</span>
                        </div>
                        <Link 
                          to={`/product-manager/specifications/${spec.sys_id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm inline-block truncate max-w-full"
                        >
                          {spec.u_name || 'Unnamed Specification'}
                        </Link>
                      </div>
                    )}

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
                          <span className="block">Category:</span>
                          <Tag color="blue" className="mt-1">
                            {product.u_category || 'Uncategorized'}
                          </Tag>
                        </div>
                        <div className="text-right">
                          <span className="block">Market:</span>
                          <Tag color="purple" className="mt-1">
                            {product.u_market_segment || 'General'}
                          </Tag>
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
                            onClick={() => handleEdit(product)}
                            className="hover:bg-blue-500/10"
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Delete this product?"
                          onConfirm={() => handleDelete(product.sys_id)}
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

      {/* Product Form Modal */}
      <Modal
        title={<span className="text-gray-200">{currentProduct ? 'Edit Product' : 'Create New Product'}</span>}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={currentProduct ? 'Update' : 'Create'}
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
              label="Product Name"
              rules={[{ required: true, message: 'Please input product name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="u_status"
              label="Status"
              initialValue="draft"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="draft">Draft</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="pending">Pending</Option>
                <Option value="archived">Archived</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="u_product_specification"
              label="Product Specification"
              rules={[{ required: true, message: 'Please select specification!' }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {specifications.map(spec => (
                  <Option key={spec.sys_id} value={spec.sys_id}>
                    {spec.u_name || 'Unnamed Specification'}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="u_price"
              label="Price"
              rules={[{ required: true, message: 'Please input price!' }]}
            >
              <Input type="number" prefix="$" />
            </Form.Item>

            <Form.Item
              name="u_category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="u_market_segment"
              label="Market Segment"
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

          <Form.Item
            name="u_image_url"
            label="Image URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}