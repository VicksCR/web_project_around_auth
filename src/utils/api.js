class Api {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.headers = options.headers;
  }

  _checkResponse(res) {
    if (!res.ok) {
      return res.json()
        ? res.json().then((err) => Promise.reject(err))
        : Promise.reject(`Error: ${res.status}`);
    }
    return res.json();
  }

  /*getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwt") || ""}`,
    };
  }*/

  getUserInfo() {
    return fetch(`${this.baseUrl}/users/me`, {
      method: "GET",
      headers: this.headers,
    }).then(this._checkResponse);
  }

  getInitialCards() {
    return fetch(`${this.baseUrl}/cards`, {
      method: "GET",
      headers: this.headers,
    }).then(this._checkResponse);
  }

  updateUserProfile(name, about) {
    return fetch(`${this.baseUrl}/users/me`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({ name, about }),
    }).then(this._checkResponse);
  }

  addNewCard(name, link) {
    return fetch(`${this.baseUrl}/cards`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ name, link }),
    }).then(this._checkResponse);
  }

  toggleLike(cardId, isLiked) {
    return fetch(`${this.baseUrl}/cards/${cardId}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
      headers: this.headers,
    }).then(this._checkResponse);
  }

  deleteCard(cardId) {
    return fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: "DELETE",
      headers: this.headers,
    }).then(this._checkResponse);
  }

  updateProfileAvatar(avatar) {
    return fetch(`${this.baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({ avatar }),
    }).then(this._checkResponse);
  }
}

const api = new Api({
  baseUrl: "https://around-api.es.tripleten-services.com/v1",
  headers: {
    Authorization: "d8103c68-c98a-47c6-ad4c-4da2fe47c74d",
    "Content-Type": "application/json",
  },
});

export default api;
