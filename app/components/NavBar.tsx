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
        {/* 1) NextV2 (My Criminal Queue) */}
        <Link
          href="http://tdcwebapps/NextV2/Queue/MyCriminalQueue"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-green-600 transition"
        >
          NextV2
        </Link>

        {/* 2) Appeals Creator */}
        <Link
          href="http://tdc-app2-p/AppealsCreatorV2"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-green-600 transition"
        >
          Appeals Creator
        </Link>

        {/* 3) TCDC Index → Index of Criminal Minutes: */}
        <Link
          href="http://tdcwebapps/TCDCIndex/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-green-600 transition"
        >
          Index of Criminal Minutes:
        </Link>

        {/* 4) Historical Criminal Search → E-Historical */}
        <Link
          href="https://ehistoricalcriminal.traviscountytx.gov/name"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-green-600 transition"
        >
          E-Historical
        </Link>

        {/* 5) Criminal Applications → Criminal Offsite */}
        <Link
          href="http://tdcwebapps/CriminalApplications"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-green-600 transition"
        >
          Criminal Offsite
        </Link>
      </div>

    </nav>
  );
}
