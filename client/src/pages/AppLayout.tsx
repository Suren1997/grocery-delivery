import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
      <p>Banner</p>
      <p>NavBar</p>
      <main className="min-h-screen">
        <Outlet />
      </main>
      <p>Footer</p>
      <p>Cart Sidebar</p>
    </>
  );
};

export default AppLayout;
