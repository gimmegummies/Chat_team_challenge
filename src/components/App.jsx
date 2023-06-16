import React, { useState } from 'react';
import ReactDOM from 'react-dom';

export const App = () => {
  const [token, setToken] = useState(''); // Variable to store the token

  const displayError = (message) => {
    const errorElement = document.createElement('p');
    errorElement.className = 'error';
    errorElement.innerText = `Error: ${message}`;
    document.body.appendChild(errorElement);
  };

  const clearErrors = () => {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach((element) => {
      element.remove();
    });
  };

  const makeRequest = (url, method, headers = {}, body = null, noJson = false) => {
    return fetch(url, {
      method: method,
      headers: headers,
      body: body,
    })
      .then((response) => {
        console.log('Response is ok: ' + response.ok);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        clearErrors();
        if (noJson) {
          return response;
        }

        return response.json();
      })
      .catch((error) => {
        console.log('Caught error in makeRequest: ' + error.message);
        displayError(error.message);
        throw error;
      });
  };

  const getToken = () => {
    const host = document.getElementById('host').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = new URLSearchParams();
    loginData.append('username', username);
    loginData.append('password', password);

    const loginUrl = `${host}/api/auth/token/login/`;

    makeRequest(loginUrl, 'POST', { 'Content-Type': 'application/x-www-form-urlencoded' }, loginData)
      .then((data) => {
        setToken(data.auth_token);
        document.getElementById('tokenDisplay').innerText = `Token: ${data.auth_token}`;
      })
      .catch((error) => {
        console.log('Caught error in getToken: ' + error.message);
      });
  };

  const getUsers = () => {
    const host = document.getElementById('host').value;
    const usersUrl = `${host}/api/auth/users/`;

    makeRequest(usersUrl, 'GET', { 'Authorization': `Token ${token}` })
      .then((data) => {
        const usersElement = document.getElementById('usersDisplay');
        usersElement.innerHTML = '';
        // check if data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        data.forEach((user) => {
          const userElement = document.createElement('p');
          userElement.innerText = `${user.id}: ${user.username}`;
          usersElement.appendChild(userElement);
        });
        clearErrors();
      })
      .catch((error) => {
        console.log('Caught error in getUsers: ' + error.message);
      });
  };

  const getMyInfo = () => {
    const host = document.getElementById('host').value;
    const myInfoUrl = `${host}/api/auth/users/me/`;

    makeRequest(myInfoUrl, 'GET', { 'Authorization': `Token ${token}` })
      .then((data) => {
        clearErrors();
        const myInfoElement = document.getElementById('myInfoDisplay');
        myInfoElement.innerText = `My Info: ${data.username}`;
      })
      .catch((error) => {
        console.log('Caught error in getMyInfo: ' + error.message);
      });
  };

  const logout = () => {
    const host = document.getElementById('host').value;
    const logoutUrl = `${host}/api/auth/token/logout/`;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = new URLSearchParams();
    loginData.append('username', username);
    loginData.append('password', password);

    makeRequest(
      logoutUrl,
      'POST',
      { 'Authorization': `Token ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      loginData,
      true
    )
      .then(() => {
        clearErrors();
        setToken('');
        document.getElementById('tokenDisplay').innerText = '';
        document.getElementById('usersDisplay').innerText = '';
        document.getElementById('myInfoDisplay').innerText = '';
      })
      .catch((error) => {
        console.log('Caught error in logout: ' + error.message);
      });
  };

  return (
    <>
      <h1>JS Requests</h1>

      <p>Select host</p>
      <div className="input-container">
        <label htmlFor="host">Host:</label>
        <select id="host">
          {/* <option value="http://127.0.0.1:8000">http://127.0.0.1:8000</option> */}
          <option value="http://olalab.hopto.org:8888" defaultValue>olalab.hopto.org:8888</option>
        </select>
      </div>

      <div className="input-container">
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" defaultValue="test" />
      </div>

      <div className="input-container">
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" defaultValue="W12345678" />
      </div>

      <button onClick={getToken}>Get Token</button>
      <button onClick={getUsers}>Get All Users</button>
      <button onClick={getMyInfo}>Get My Info</button>
      <button onClick={logout}>Logout</button>

      <p id="tokenDisplay"></p>
      <div id="usersDisplay"></div>
      <div id="myInfoDisplay"></div>
    </>
  );
};

// export default App;
