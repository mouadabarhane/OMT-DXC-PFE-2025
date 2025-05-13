import { Outlet } from "react-router-dom";
import Sidebar from "./dashbord/sidebar";
import Header from "./dashbord/header";
import Footer from "./dashbord/footer";
import VirtualAgentButton from "../components/VirtualAgent/VirtualAgentButton";
function dashbord() {
    return (
        <div className="dashboard-layout flex">
            <Sidebar />
            <div className="dashboard-content w-full">
                <Header />
                <div className="bg-gray-100/50 min-h-[calc(100vh-64px)] p-4"> {/* Added padding */}
                    <Outlet /> {/* ProductDetailPage will render here */}
                </div>
                <VirtualAgentButton /> 
            </div>
            <Footer />
            <footer />
        </div>
    );
}

export default dashbord;