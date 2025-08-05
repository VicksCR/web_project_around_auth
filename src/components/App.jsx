import "../../src/index.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

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
  const [currentUser, setCurrentUser] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [cards, setCards] = useState([]);
  const [popup, setPopup] = useState(null);
  const [infoToolTip, setInfoToolTip] = useState({
    open: false,
    success: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      auth
        .checkToken(token)
        .then((res) => {
          setEmail(res.data.email);
          setLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem("jwt");
        });
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    api.getUserInfo().then(setCurrentUser).catch(console.error);

    api.getInitialCards().then(setCards).catch(console.error);
  }, [loggedIn]);

  const handelRegister = (email, password) => {
    auth
      .register(email, password)
      .then(() => {
        setInfoToolTip({ open: true, success: true });
        navigate("/signin");
      })
      .catch(() => {
        setInfoToolTip({ open: true, success: false });
      });
  };

  const handleLogin = (email, password) => {
    auth
      .authorize(email, password)
      .then(({ token }) => {
        localStorage.setItem("jwt", token);
        setLoggedIn(true);
        setEmail(email);
        navigate("/");
      })
      .catch(() => {
        setInfoToolTip({ open: true, success: false });
      });
  };

  const handelLogout = () => {
    localStorage.removeItem("jwt");
    setLoggedIn(false);
    setEmail("");
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
        <Header email={email} onLogout={handelLogout} loggedIn={loggedIn} />

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
            element={<Register onRegister={handelRegister} />}
          />
          <Route path="/signin" element={<Login onLogin={handleLogin} />} />
          <Route
            path="*"
            element={<Navigate to={loggedIn ? "/" : "/signin"} />}
          />
        </Routes>

        <InfoToolTip
          isOpen={infoToolTip.open}
          isSuccess={infoToolTip.success}
          onClose={() => setInfoToolTip({ open: false, success: false })}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}
