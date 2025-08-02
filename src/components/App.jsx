import "../../src/index.css";
import { useEffect, useState } from "react";

import api from "../utils/api.js";

import Header from "./Header/Header.jsx";
import Main from "./Main/Main.jsx";
import CurrentUserContext from "../contexts/CurrentUserContext.js";

export default function App() {
  const [popup, setPopup] = useState(null);
  const [currentUser, setCurrentUser] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    api
      .getUserInfo()
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => {
        console.error("Error al cargar la información del usuario:", err);
      });
  }, []);

  useEffect(() => {
    api
      .getInitialCards()
      .then((data) => {
        setCards(data);
      })
      .catch((err) => {
        console.error("Error al cargar las tarjetas:", err);
      });
  }, []);

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
    <div className="page">
      <CurrentUserContext.Provider value={{ currentUser, handleUpdateUser }}>
        <Header />
        <Main
          popup={popup}
          onOpenPopup={handleOpenPopup}
          onClosePopup={handleClosePopup}
          onUpdateAvatar={handleUpdateAvatar}
          cards={cards}
          onCardLike={handleCardLike}
          onCardDelete={handleCardDelete}
          onCardSubmit={handleAddPlaceSubmit}
        />
      </CurrentUserContext.Provider>
    </div>
  );
}
