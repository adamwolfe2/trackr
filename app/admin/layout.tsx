export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F3F3EF] p-6 md:p-10">
            {children}
        </div>
    );
}
