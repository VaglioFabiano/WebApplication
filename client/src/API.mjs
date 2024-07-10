const SERVER_URL = 'http://localhost:3001';

 const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};


 const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};


 const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}


export const getMemesById = async (excludeIds = []) => {
  const queryString = excludeIds.length ? excludeIds.join(',') : '';
  const response = await fetch(SERVER_URL + `/api/memes${queryString ? '/' + queryString : ''}`, {
    credentials: 'include',
  });

  if (response.ok) {
    const meme = await response.json();
    return meme;
  } else {
    throw new Error('Failed to fetch meme');
  }
};

export const getMemesByIdNoExclude = async (id) => {
  const response = await fetch(SERVER_URL + "/api/memes/correct/"+id, {
    credentials: 'include',
  });
  if(response.ok) {
    const meme = await response.json();
    return meme;
  } else {
    throw new Error('Failed to fetch meme');
  }
};

export const getCorrectCaptionByMemeId = async (id) => {
  const response = await fetch(`${SERVER_URL}/api/memes/${id}/captions`, {
    credentials: 'include',
  });
  if(response.ok) {
    const captions = await response.json();
    return captions;
  } else {
    throw new Error('Failed to fetch captions');
  }
};

export const getRandomCaption = async (id) => {
  const response = await fetch(`${SERVER_URL}/api/memes/${id}/captions/random`, {
    credentials: 'include',
  });
  if(response.ok) {
    const captions = await response.json();
    return captions;
  } else {
    throw new Error('Failed to fetch random captions');
  }
};

export const getDidascalie = async (id) => {
  const response = await fetch(SERVER_URL+'/api/captions/'+id,{
    credentials: 'include',
  });
  if(response.ok) {
    const captions = await response.json();
    return captions;
  } else {
    throw new Error('Failed to fetch didascalie');
  }
};

export const getGamesByUserId = async (id) => {
  const response = await fetch(`${SERVER_URL}/api/users/${id}/games`, {
    credentials: 'include',
  });
  if(response.ok) {
    const games = await response.json();
    return games;
  } else {
    throw new Error('Failed to fetch games');
  }
};

export const getRoundsByGameId = async (id) => {
  const response = await fetch(`${SERVER_URL}/api/games/${id}/rounds`, {
    credentials: 'include',
  });
  if(response.ok) {
    const rounds = await response.json();
    return rounds;
  } else {
    throw new Error('Failed to fetch rounds');
  }
};



export const insertGame = async (userId, score) => {
  const response = await fetch(`${SERVER_URL}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ user_id: userId, score }),
  });
  if(response.ok) {
    const game = await response.json();
    return game;
  } else {
    throw new Error('Failed to insert game');
  }
};

export const insertRounds = async (memeId, captionId, score) => {
  const response = await fetch(`${SERVER_URL}/api/rounds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ meme_id: memeId, caption_id: captionId, score }),
  });
  if(response.ok) {
    const round = await response.json();
    return round;
  } else {
    throw new Error('Failed to insert round');
  }
};

const API = { logIn, logOut, getUserInfo};
export default API;