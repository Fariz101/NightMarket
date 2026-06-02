import { Package, Home, Receipt, User, UserPen, Users } from "lucide-react"

export const items = [
    {
        title: "Home",
        url: "/admin/dashboard",
        icon: Home,
    },
    {
        title: "My Profile",
        url: "/admin/profile",
        icon: UserPen,
    },
    {
        title: "Admin Data",
        url: "/admin/admins",
        icon: User,
    },
    {
        title: "Customer Data",
        url: "/admin/customers",
        icon: Users,
    },
    {
        title: "Seller Data",
        url: "/admin/sellers",
        icon: Users,
    },
    {
        title: "Products",
        url: "/admin/products",
        icon: Package,
    },
    {
        title: "Transactions",
        url: "/admin/transactions",
        icon: Receipt,
    },

    
]