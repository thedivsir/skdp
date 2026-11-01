
import { NavLink } from "react-router-dom";

const registrationTabs = [
  {
    label: "सदस्यता पंजीकरण",
    path: "/membership/panjikaran",
  },
  {
    label: "मंदिर भ्रमण टिकट बुकिंग",
    path: "/tourism/ticket",
  },
  {
    label: "धार्मिक कार्यक्रम पंजीकरण",
    path: "/registration",
  },
  {
    label: "रोज़गार प्रशिक्षण पंजीकरण",
    path: "/rojgaar-prashikshan/panjikaran",
  },
  {
    label: "खेल भारती पंजीकरण",
    path: "/khel-bhaarti-school-game-pariyojna/panjikaran",
  },
  {
    label: "प्रॉपर्टी डीलरशिप पंजीकरण",
    path: "/property-dealership/panjikaran",
  },
  {
    label: "माला एवं कवच सेवा पंजीकरण",
    path: "/mala-kavach-seva/panjikaran",
  },
];

export default function RegistrationTabs() {
  return (
    <nav
      aria-label="पंजीकरण पृष्ठ"
      className="sticky top-0 z-30 border-y border-[#e5c78d] bg-[#fffaf1] shadow-sm"
    >
      <div className="mx-auto max-w-full overflow-x-auto">
        <div className="flex min-w-max items-center gap-1 px-3 py-2 sm:px-5 lg:justify-center">
          {registrationTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                [
                  "whitespace-nowrap rounded-lg px-4 py-3",
                  "text-sm font-semibold transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#9a642a]",
                  isActive
                    ? "bg-[#7b1b26] !text-white"
                    : "text-[#7b1b26] hover:bg-[#f3e5cb]",
                ].join(" ")
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
