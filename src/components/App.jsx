import "../../src/index.css";
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import * as auth from "../utils/auth.js";
import api from "../utils/api.js";

import Header from "./Header/Header.jsx";
import Main from "./Main/Main.jsx";
import Login from "../components/Main/components/Login/Login.jsx";
import Register from "../components/Main/components/Register/Register.jsx";
import InfoToolTip from "../components/Main/components/InfoToolTip/InfoToolTip.jsx";
import ProtectedRoute from "../components/Main/components/ProtectedRoute/ProtectedRoute.jsx";
import CurrentUserContext from "../contexts/CurrentUserContext.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [cards, setCards] = useState([]);
  const [popup, setPopup] = useState(null);
  const [infoToolTip, setInfoToolTip] = useState({
    open: false,
    success: false,
    message: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const showRegisterLink = location.pathname === "/signin";
  const showLoginLink = location.pathname === "/signup";

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    auth
      .checkToken(token)
      .then((userData) => {
        const email = userData?.data?.email || userData?.email || null;
        setCurrentUser((prev) => ({ ...prev, email }));
        setLoggedIn(true);

        return Promise.all([api.getUserInfo(), api.getInitialCards()]);
      })
      .then(({ userFromContentApi, cardsData }) => {
        setCurrentUser((prev) => ({ ...prev, ...userFromContentApi }));
        setCards(Array.isArray(cardsData) ? cardsData : []);
      })
      .catch((err) => {
        console.error("Error al verificar el token:", err);
        handleLogout();
      });
  }, []);

  const handleRegister = async (email, password) => {
    try {
      await auth.register(email, password);
      setInfoToolTip({
        open: true,
        success: true,
        message: "Registro exitoso",
      });
      setTimeout(() => {
        setInfoToolTip({ open: false, success: true, message: "" });
        navigate("/signin");
      }, 2000);
    } catch (err) {
      console.error("Error al registrarse:", err);
      setInfoToolTip({
        open: true,
        success: false,
        message: err.message || "Error al registrarse",
      });
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const { token } = await auth.authorize(email, password);
      localStorage.setItem("jwt", token);

      const userData = await auth.checkToken(token);
      setCurrentUser({ email: userData?.data?.email || userData?.email || "" });
      setLoggedIn(true);

      const [userFromContentApi, cardsData] = await Promise.all([
        api.getUserInfo(),
        api.getInitialCards(),
      ]);
      setCurrentUser((prev) => ({ ...prev, ...userFromContentApi }));
      setCards(cardsData);

      setInfoToolTip({
        open: true,
        success: true,
        message: "¡Ingreso exitoso!",
      });
      setTimeout(() => {
        setInfoToolTip({ open: false, success: false, message: "" });
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setInfoToolTip({
        open: true,
        success: false,
        message: "Email o contrase;a no validos",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setLoggedIn(false);
    setCurrentUser({});
    setCards([]);
    navigate("/signin");
  };

  //CODIGO INICIAL
  const handleAddPlaceSubmit = ({ name, link }) => {
    (async () => {
      await api
        .addNewCard(name, link)
        .then((newCard) => {
          setCards([newCard, ...cards]);
          handleClosePopup();
        })
        .catch((err) => {
          console.error("Error al agregar una nueva tarjeta:", err);
        });
    })();
  };

  const handleUpdateUser = (data) => {
    (async () => {
      await api
        .updateUserProfile(data.name, data.about)
        .then((newData) => {
          setCurrentUser(newData);
          handleClosePopup();
        })
        .catch((err) => {
          console.error("Error al actualizar la información del usuario:", err);
        });
    })();
  };

  const handleUpdateAvatar = (avatarUrl) => {
    (async () => {
      await api
        .updateProfileAvatar(avatarUrl)
        .then((newData) => {
          setCurrentUser(newData);
          handleClosePopup();
        })
        .catch((err) => {
          console.error("Error al actualizar el avatar del usuario:", err);
        });
    })();
  };

  function handleOpenPopup(popup) {
    setPopup(popup);
  }

  function handleClosePopup() {
    setPopup(null);
  }

  async function handleCardLike(card) {
    try {
      const newCard = await api.toggleLike(card._id, !card.isLiked);
      setCards((state) =>
        state.map((currentCard) =>
          currentCard._id === card._id
            ? { ...currentCard, isLiked: !currentCard.isLiked }
            : currentCard
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCardDelete(cardId) {
    await api
      .deleteCard(cardId)
      .then(() => {
        setCards((state) =>
          state.filter((currentCard) => currentCard._id !== cardId)
        );
        handleClosePopup();
      })
      .catch((err) => {
        console.error("Error al eliminar la tarjeta:", err);
      });
  }

  return (
    <CurrentUserContext.Provider value={{ currentUser, handleUpdateUser }}>
      <div className="page">
        <Header
          isLoggedIn={loggedIn}
          userEmail={currentUser?.email}
          onLogout={handleLogout}
          showRegisterLink={showRegisterLink}
          showLoginLink={showLoginLink}
        />

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <Main
                  popup={popup}
                  onOpenPopup={handleOpenPopup}
                  onClosePopup={handleClosePopup}
                  onUpdateAvatar={handleUpdateAvatar}
                  cards={cards}
                  setCards={setCards}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                  onCardSubmit={handleAddPlaceSubmit}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              loggedIn ? (
                <Navigate to="/" />
              ) : (
                <Register
                  onRegister={handleRegister}
                  infoToolTip={infoToolTip}
                  setTooltip={setInfoToolTip}
                />
              )
            }
          />
          <Route
            path="/signin"
            element={
              loggedIn ? (
                <Navigate to="/" />
              ) : (
                <Login
                  onLogin={handleLogin}
                  infoToolTip={infoToolTip}
                  setInfoToolTip={setInfoToolTip}
                />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <InfoToolTip
          isOpen={infoToolTip.open}
          isSuccess={infoToolTip.success}
          message={infoToolTip.message}
          onClose={() => {
            setInfoToolTip({ open: false, success: false, message: "" });
          }}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}
