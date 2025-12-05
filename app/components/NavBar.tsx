import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b">
      
      {/* LEFT SIDE: LOGO */}
      <div className="text-xl font-semibold">
        <Link href="/">Case Converter</Link>
      </div>

      {/* RIGHT SIDE: NAV LINKS */}
      <div className="flex gap-6 text-md">
        <Link className="hover:text-green-600 transition" href="/">
          Home
        </Link>
        <Link className="hover:text-green-600 transition" href="/tools">
          Tools
        </Link>
        <Link className="hover:text-green-600 transition" href="/settings">
          Settings
        </Link>
      </div>

    </nav>
  );
}