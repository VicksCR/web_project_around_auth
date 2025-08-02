import logo from "../../images/header-logo1.svg";
import line from "../../images/Line.jpg";

export default function Header() {
  return (
    <header className="header">
      <img
        src={logo}
        alt="Around The US Typographic Logo"
        className="header__logo"
      />
      <img src={line} alt="Line" className="header__line" />
    </header>
  );
}
