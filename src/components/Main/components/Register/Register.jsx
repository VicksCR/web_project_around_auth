export default function Register({ onRegister }) {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData.email, formData.password);
  };

  return (
    //header
    <form className="login__form" onSubmit={handleSubmit}>
      <h2>Inicia sesión</h2>
      <input
        className="login__input"
        name="email"
        type="email"
        onChange={handleChange}
        value={formData.email}
      />
      <input
        className="login__input"
        name="password"
        type="password"
        onChange={handleChange}
        value={formData.password}
      />
      <button className="login__button">Inicia sesión</button>
    </form>
  );
}
//ACTUALIZAR DE ACUERDO A FIGMA
