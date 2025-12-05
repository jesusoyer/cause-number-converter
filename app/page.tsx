import NavBar from "./components/NavBar";
import CaseNumberField from "./components/CaseNumberField";

export default function Home() {
  return (
    <div>
      <NavBar />
      <main>
        <CaseNumberField />
      </main>
    </div>
  );
}

