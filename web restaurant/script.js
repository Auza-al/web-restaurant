let themeBtn = document.querySelector('#theme-btn');
let menuBar = document.querySelector('#menu-bar');
let navbar = document.querySelector('.navbar');
let menuGrid = document.querySelector('.menu-grid');

// 1. Logik Tukar Mode Gelap & Ikon
themeBtn.onclick = () => {
    themeBtn.classList.toggle('fa-sun');
    document.body.classList.toggle('dark-mode');
};

// Kod sedia ada anda di atas...

// Fungsi untuk menetapkan paparan awal semasa refresh
window.onload = () => {
    // Cari butang yang mempunyai kelas 'active' (biasanya Breakfast) dan klik secara automatik
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        activeTab.click();
    }
};

// 2. Menu Responsive
menuBar.onclick = () => {
    menuBar.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}

window.onscroll = () => {
    menuBar.classList.remove('fa-times');
    navbar.classList.remove('active');
}

// 3. Tab Menu & Filter
const tabs = document.querySelectorAll('.tab-btn');
const items = document.querySelectorAll('.menu-item');

tabs.forEach(tab => {
    tab.onclick = () => {
        // Tukar butang aktif
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const target = tab.getAttribute('data-target');
        
        if(menuGrid) menuGrid.scrollLeft = 0;

        items.forEach(item => {
            // Logik filter yang betul
            if (item.getAttribute('data-category') === target) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
});

let cart = [];
let total = 0;

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart') || e.target.parentElement.classList.contains('add-to-cart')) {
        const button = e.target.closest('.add-to-cart');
        const box = button.closest('.box'); // Mengambil box makanan terkait
        
        const foodName = box.querySelector('h4').innerText;
        // Mengambil angka saja dari harga (Contoh: RM24 -> 24)
        const foodPrice = parseInt(box.querySelector('.price-tag').innerText.replace('IDR', ''));

        // Masukkan ke data cart
        cart.push({ name: foodName, price: foodPrice });
        total += foodPrice;

        updateCartUI();
    }
});

function updateCartUI() {
    const cartItemsElement = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('#total-price');

    // Hapus pesan kosong
    cartItemsElement.innerHTML = '';

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p class="empty-msg">Belum ada pesanan.</p>';
    } else {
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <h5>${item.name}</h5>
                <span class="price">IDR ${item.price}</span>
            `;
            cartItemsElement.appendChild(itemDiv);
        });
    }

    totalPriceElement.innerText = `IDR ${total}`;
}

async function checkout() {
    const selectedTable = document.querySelector('#selected-table-value').value;
    const scriptURL = 'LINK_DARI_spreadsheets'; // Paste link Web App Google kamu di sini

    if (cart.length === 0) {
        alert("Pilih menu makanan dulu ya!");
        return;
    }

    if (!selectedTable) {
        alert("Jangan lupa pilih nomor meja!");
        return;
    }

    // Menggabungkan semua nama makanan jadi satu teks panjang
    const itemNames = cart.map(item => item.name).join(', ');

    const orderData = {
        items: itemNames,
        table: selectedTable,
        total: `IDR ${total}`
    };

    try {
        // Ubah tampilan tombol biar user tau data lagi dikirim
        const btn = document.querySelector('.btn-proses');
        const originalText = btn.innerText;
        btn.innerText = "Mengirim Pesanan...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        // Proses pengiriman data ke Google Sheets
        await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        alert(`✅ PESANAN TERKIRIM!\nMeja: ${selectedTable}\nTotal: IDR ${total}\n\nMohon tunggu sebentar ya.`);
        
        // Reset pesanan dan tampilan meja
        cart = [];
        total = 0;
        document.querySelector('#selected-table-value').value = "";
        document.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
        updateCartUI();
        
        // Balikin tombol ke semula
        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;

    } catch (error) {
        console.error('Error!', error.message);
        alert("Duh, ada masalah koneksi. Coba lagi ya!");
    }
}

const tableCards = document.querySelectorAll('.table-card');
const hiddenInput = document.querySelector('#selected-table-value');

// Pastikan elemen statusMsg sudah wujud (seperti dalam kod sebelumnya)
if (!document.querySelector('.status-msg')) {
    const tableSection = document.querySelector('.table-section');
    const msg = document.createElement('p');
    msg.className = 'status-msg';
    msg.style.cssText = "font-size: 1.4rem; margin-top: 1rem; color: var(--primary); font-weight: 600; min-height: 2rem;";
    tableSection.appendChild(msg);
}
const statusMsg = document.querySelector('.status-msg');

tableCards.forEach(card => {
    card.onclick = () => {
        const tableNum = card.getAttribute('data-table');

        // SEMAK: Jika meja ini sudahpun dipilih (User mahu BATALKAN)
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            hiddenInput.value = ""; // Kosongkan nilai
            statusMsg.innerHTML = `<i class="fas fa-info-circle"></i> Pilihan meja dibatalkan. Silahkan pilih meja.`;
            statusMsg.style.color = "#888"; // Warna neutral untuk pembatalan
        } 
        // JIKA TIDAK: User mmau PILIH meja ini
        else {
            // Buang 'selected' dari meja lain (Hanya satu meja dibenarkan)
            tableCards.forEach(c => c.classList.remove('selected'));
            
            card.classList.add('selected');
            hiddenInput.value = tableNum;
            statusMsg.innerHTML = `<i class="fas fa-check-circle"></i> Anda telah memilih Meja ${tableNum}`;
            statusMsg.style.color = "var(--primary)";
        }
    }
});