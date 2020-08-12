'use strict';
(function () {
    const appLogin = document.querySelector('#app-login');
    const appStore = document.querySelector('#app-store');
    const btnAddItem = document.querySelector('.handler .btn-add');
    const ulStore = document.querySelector('.store');
    const txtNewItem = document.querySelector('.add-item');
    const txtNewQuant = document.querySelector('.add-quant');
    const btnLogin = document.querySelector('.handler .btn-login');
    const txtUserName = document.querySelector('.user-name');
    const alert = document.querySelector('.alert-error');
    const loading =  document.querySelector('.loading');
    const btnLogout = document.querySelector('.handler .btn-logout');

    //Get User Session
    const getSession = () =>  { 
        fetch('/session/', {
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(session => {
            renderLogin(false);
            renderInventory(true);
            getStoreInventory();
        })
        .catch(err =>  {
            if(!err.session) {
                renderLogin(true);
                renderInventory(false);
            }
        });
    }
    
    // Create User Session
    const createSession = () =>  { 
        const username = txtUserName.value;
        fetch('/session/', {
            method: 'POST',
            headers: new Headers({
                'content-type' : 'application/json'
            }),
            body : JSON.stringify({username : username})
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(session => {
            txtUserName.value = '';
            renderLogin(false);
            renderInventory(true);
            getStoreInventory();
        })
        .catch(err =>  {
            if(err.error) {
                renderAlert(err.message);
            }
        });
    }

    // Destroy User Session
    const destroySession = () =>  { 
        fetch(`/session/`, {
            method: 'DELETE',
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(destroyed => {
            setDefaults();
        })
        .catch(err =>  { });
    }

    // Get Store Items
    const getStoreInventory = () =>  { 
        renderLoading(true);
        fetch('/items/', {
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(store => {
            renderLoading(false);
            renderStoreItems(store);
        })
        .catch(err =>  {
            if(!err.session) {
                renderLogin(true);
                renderInventory(false);
                renderAlert(err.message);
            }
        });
    }

    // Create Store item
    const createStoreItem = () =>  {
        const name = txtNewItem.value;
        const quantity = txtNewQuant.value;
        fetch('/items/', {
            method: 'POST',
            headers: new Headers({
                'content-type' : 'application/json'
            }),
            body : JSON.stringify({name : name, quantity : quantity})
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(item => {
            getStoreInventory();
        })
        .catch(err =>  {
            renderAlert(err.message);
            if(!err.session) {
                renderLogin(true);
                renderInventory(false);
            }
        });
    }

    // Update Store Item
    const updateStoreItem = (id) =>  { 
        const name = document.querySelector('.update-item[data-id="' + id + '"]').value;
        const quantity =  document.querySelector('.update-quant[data-id="' + id + '"]').value;
        fetch(`/items/${id}`, {
            method: 'PUT',
            headers: new Headers({
                'content-type' : 'application/json'
            }),
            body : JSON.stringify({name : name, quantity : quantity})
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(item => {
            getStoreInventory();
        })
        .catch(err =>  {
            renderAlert(err.message);
            getStoreInventory();
            if(!err.session) {
                renderLogin(true);
                renderInventory(false);
            }
        });
    }

    //Delete Store Item
    const deleteStoreItem = (id) =>  { 
        fetch(`/items/${id}`, {
            method: 'DELETE',
        })
        .then(res => {
            if(res.ok) { return res.json(); }
            return res.json().then(err => Promise.reject(err));
        })
        .then(item => {
            getStoreInventory();
        })
        .catch(err =>  {
            renderAlert(err.message);
            if(!err.session) {
                renderLogin(true);
                renderInventory(false);
            }
        });
    }

    // Render Store Items
    const renderStoreItems = (store) => {
        ulStore.innerHTML = '';
        for (const key in store) {
            const item = store[key];
            ulStore.innerHTML += `
                <li class="item-group-child">
                    <div class="item-grid">
                        <input type="text" class="update-item form-control" data-id="${key}" value="${item.name}"
                            placeholder="${item.name}" />
                        <input type="text" class="update-quant form-control" data-id="${key}" value="${item.quantity}"
                            placeholder="${item.quantity}" />
                        <input type="button" class="btn btn-update" data-id="${key}" value="Update"/>
                        <button data-id="${key}" class="btn btn-delete">X</button>
                    </div>
                </li>
            `;
        }
    };

    btnLogin.addEventListener('click', function () {
        createSession();
    });

    txtUserName.addEventListener('keyup', function (event) {
        renderAlert();
        const username = event.target.value;
        btnLogin.disabled = !username;
    });

    ulStore.addEventListener('click', function (event) {
        renderAlert();
        const id = event.target.dataset.id;
        if(event.target.classList.contains('btn-update')) {
            updateStoreItem(id);
        }

        if(event.target.classList.contains('btn-delete')) {
            deleteStoreItem(id);
        }
    });
  
    btnAddItem.addEventListener('click', function (event) {
        renderAlert();
        createStoreItem();
        txtNewItem.value = '';
        txtNewQuant.value = '';
        btnAddItem.disabled = true;
    });
  
    txtNewItem.addEventListener('keyup', function (event) {
        renderAlert();
        const name = event.target.value;
        btnAddItem.disabled = !name;
    });

    btnLogout.addEventListener('click', function () {
        renderAlert();
        destroySession();
    });

    const renderLogin = (show) => {
        show ? appLogin.classList.remove('hidden') : appLogin.classList.add('hidden');
    }

    const renderInventory = (show) => {
        show ? appStore.classList.remove('hidden') : appStore.classList.add('hidden');
    }

    const renderAlert = (msg) => {
        msg ? alert.classList.remove('hidden') : alert.classList.add('hidden');
        alert.innerText = msg;
    }

    const renderLoading = (show) => {
        show ? loading.classList.remove('hidden') : loading.classList.add('hidden');
    }

    const setDefaults = () => {
        txtUserName.value = '';
        txtNewItem.value = '';
        txtNewQuant.value = '';
        btnAddItem.disabled = true;
        btnLogin.disabled = true;
        renderLogin(true);
        renderInventory(false);
        renderAlert();
    }
  
    setDefaults();
    getSession();

})();
