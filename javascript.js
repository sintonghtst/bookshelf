const buku = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('input-buku');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBuku();
    });

    const searchForm = document.getElementById('cari-buku');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchJudul = document.getElementById('cari-judul-buku').value;
        const searchPenulis = document.getElementById('cari-penulis-buku').value;
        const searchTahun = parseInt(document.getElementById('cari-tahun-buku').value);

        searchBooks(searchJudul, searchPenulis, searchTahun);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            buku.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBuku() {
    const textJudul = document.getElementById('input-judul-buku').value;
    const textPenulis = document.getElementById('input-penulis-buku').value;
    const txtTahun = parseInt(document.getElementById('input-tahun-buku').value);
    const cek = document.getElementById('input-buku-isComplete').checked;

    if (!textJudul || !textPenulis || !txtTahun) {
        alert('Kolom tidak boleh ada yang kosong');
        return;
    }
    
    const generatedID = generateID();
    const bookshelfObject = generateBookshelfObject(generatedID, textJudul, textPenulis, txtTahun, cek, false);
    buku.push(bookshelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert('Buku telah di Simpan');
};

function generateID() {
    return + new Date();
};

function generateBookshelfObject(id, judul, penulis, tahun, isCompleted) {
    return {
        id,
        judul,
        penulis,
        tahun: parseInt(tahun),
        isCompleted
    };
};

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(buku);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    };
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
})

document.addEventListener(RENDER_EVENT, function () {
    renderBooks(buku);
});

function renderBooks(books) {
    const uncompletedBookList = document.getElementById('inCompletedBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('CompletedBookshelfList');
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
}

function makeBook(bookshelfObject) {
    const textJudul = document.createElement('h3');
    textJudul.innerText = bookshelfObject.judul;

    const textPenulis = document.createElement('p');
    textPenulis.innerText = "Penulis : " + bookshelfObject.penulis;
    
    const textTahun = document.createElement('p');
    textTahun.innerText = "Tahun : " + bookshelfObject.tahun;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textJudul, textPenulis, textTahun);

    const columnArticle = document.createElement("article");
    columnArticle.classList.add("buku");
    columnArticle.append(textContainer);
    columnArticle.setAttribute('id', `book-${bookshelfObject.id}`);

    if (bookshelfObject.isCompleted) {
        const statusButton = document.createElement('button');
        statusButton.innerText = "Belum Selesai dibaca";
        statusButton.classList.add('statusBelumBaca');

        statusButton.addEventListener('click', function () {
            statusFromCompletedBuku(bookshelfObject.id);
        });

        const editButton = document.createElement('button');
        editBuku.inner
        editButton.classList.add('edit');

        editButton.addEventListener('click', function () {
            editBuku(bookshelfObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');

        deleteButton.addEventListener('click', function () {
            deleteBuku(bookshelfObject.id);
        });

        columnArticle.append(statusButton, editButton, deleteButton);
    } else {
        const statusButton = document.createElement('button');
        statusButton.innerText = "Selesai dibaca";
        statusButton.classList.add('statusSudahBaca');

        statusButton.addEventListener('click', function () {
            statusToCompletedBuku(bookshelfObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit');

        editButton.addEventListener('click', function () {
            editBuku(bookshelfObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');

        deleteButton.addEventListener('click', function () {
            deleteBuku(bookshelfObject.id);
        });

        columnArticle.append(statusButton, editButton, deleteButton);
    }

    return columnArticle;
}

function statusFromCompletedBuku(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert('Buku telah di pindahkan ke "BELUM SELESAI DIBACA"');
}

function statusToCompletedBuku(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert('Buku telah di pindahkan ke "SUDAH SELESAI DIBACA"');
}

function deleteBuku(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus buku ini?');

    if (confirmDelete) {
        buku.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        alert('Buku berhasil dihapus');
    }
}
function findBook(bookId) {
    for (const bookItem of buku) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}
function findBookIndex(bookId) {
    for (const index in buku) {
        if (buku[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function searchBooks(cariJudul, cariPenulis, cariTahunString) {
    const cariTahun = parseInt(cariTahunString);

    const filteredBooks = buku.filter(book =>
        book.judul.toLowerCase().includes(cariJudul.toLowerCase()) &&
        book.penulis.toLowerCase().includes(cariPenulis.toLowerCase()) &&
        (isNaN(cariTahun) || book.tahun === cariTahun)
    );
    renderBooks(filteredBooks);
}

function editBuku(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    const editedJudul = prompt('Masukkan judul buku baru:', bookTarget.judul);
    if (editedJudul === null) {
        alert('Pengeditan buku dibatalkan');
        return;
    }
    const editedPenulis = prompt('Masukkan penulis buku baru:', bookTarget.penulis);
    if (editedPenulis === null) {
        alert('Pengeditan buku dibatalkan');
        return;
    }
    const editedTahunString = prompt('Masukkan tahun buku baru:', bookTarget.tahun.toString());
    if (editedTahunString === null) {
        alert('Pengeditan buku dibatalkan');
        return;
    }
    const editedTahun = parseInt(editedTahunString);
    if (isNaN(editedTahun)) {
        alert('Tahun harus berupa angka');
        return;
    }

    if (editedJudul || editedPenulis || !isNaN(editedTahun)) {
        bookTarget.judul = editedJudul || bookTarget.judul;
        bookTarget.penulis = editedPenulis || bookTarget.penulis;
        bookTarget.tahun = editedTahun || bookTarget.tahun;

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        alert('Buku berhasil diubah');
    }
}