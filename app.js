// Local Medicine Inventory Array Configuration (Pakistan Context)
const medicineCatalog = [
    { id: 1, name: "Panadol 500mg", category: "Pain Relief", dose: "Paracetamol - 10 Tablets Strip", price: 30 },
    { id: 2, name: "Arinac Forte", category: "Allergy & Cold", dose: "Ibuprofen + Pseudoephedrine - 10 tabs", price: 95 },
    { id: 3, name: "Softin 10mg", category: "Allergy & Cold", dose: "Loratadine - Antihistamine 10 tabs", price: 180 },
    { id: 4, name: "Augmentin 625mg", category: "Antibiotics", dose: "Co-Amoxiclav (Rx Required) - 6 tabs", price: 340 },
    { id: 5, name: "Surbex Z", category: "General", dose: "High Potency Vitamin Zinc + B-Complex - 30 Tabs", price: 420 },
    { id: 6, name: "Lipiget 10mg", category: "Chronic Care", dose: "Atorvastatin Cholesterol - 10 tabs", price: 290 },
    { id: 7, name: "Concor 5mg", category: "Chronic Care", dose: "Bisoprolol Blood Pressure - 14 tabs", price: 245 },
    { id: 8, name: "Risek 40mg", category: "Chronic Care", dose: "Omeprazole Gastric Acidity Care - 14 caps", price: 400 },
    { id: 9, name: "Flagyl 400mg", category: "Antibiotics", dose: "Metronidazole Antibacterial - 20 tabs", price: 130 },
    { id: 10, name: "Hydryllin Syrup", category: "Allergy & Cold", dose: "Cough Formula expectorant - 120ml", price: 115 },
    { id: 11, name: "Entamizole Tablets", category: "Antibiotics", dose: "Diarrhea/Amoebiasis Protection - 20 tabs", price: 165 },
    { id: 12, name: "ORS Hydralyte", category: "General", dose: "Oral Rehydration Salts Sachet", price: 25 },
    { id: 13, name: "Surgical Face Masks", category: "General", dose: "Protective Layer Filters - 10 Box Pack", price: 80 },
    { id: 14, name: "Brufen 400mg", category: "Pain Relief", dose: "Ibuprofen Painkiller Analgesic - 10 tabs", price: 55 }
];

let cart = {};
let activeCategory = "All";
let isPrescriptionAttached = false;

// Initialize Application UI Setup on Load
document.addEventListener("DOMContentLoaded", () => {
    renderCatalog();
    setupEventListeners();
    updatePreview();
});

// Event Handlers Binding
function setupEventListeners() {
    document.getElementById("searchBar").addEventListener("input", renderCatalog);
    
    // Category Tabs Filter Binding
    document.getElementById("categoryTabs").addEventListener("click", (e) => {
        if (e.target.classList.contains("tab")) {
            activeCategory = e.target.getAttribute("data-category");
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            renderCatalog();
        }
    });

    // Form Fields Binding for Real-Time Validation Updates
    document.getElementById("custName").addEventListener("input", updatePreview);
    document.getElementById("custPhone").addEventListener("input", updatePreview);
    document.getElementById("custAddress").addEventListener("input", updatePreview);
    document.getElementById("paymentMethod").addEventListener("change", updatePreview);
    document.getElementById("callbackToggle").addEventListener("change", updatePreview);
    document.getElementById("orderNotes").addEventListener("input", updatePreview);
    document.getElementById("legalDisclaimer").addEventListener("change", updatePreview);
    document.getElementById("prescriptionFile").addEventListener("change", handleFileAttach);
    
    // Fulfillment Selector Radios
    document.querySelectorAll('input[name="fulfillment"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            const addrWrapper = document.getElementById("addressWrapper");
            if (e.target.value === "Pickup") {
                addrWrapper.style.display = "none";
            } else {
                addrWrapper.style.display = "block";
            }
            renderCart(); // Forces pricing rules recalculation
        });
    });

    // WhatsApp Execution Trigger
    document.getElementById("submitOrderBtn").addEventListener("click", sendToWhatsApp);
}

// Render Products Grid UI
function renderCatalog() {
    const listContainer = document.getElementById("medicineList");
    listContainer.innerHTML = "";
    const searchVal = document.getElementById("searchBar").value.toLowerCase();

    medicineCatalog.forEach(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchVal) || item.dose.toLowerCase().includes(searchVal);
        const matchesCategory = (activeCategory === "All" || item.category === activeCategory);

        if (matchesSearch && matchesCategory) {
            const div = document.createElement("div");
            div.className = "med-item";
            div.innerHTML = `
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>${item.dose}</p>
                    <div class="med-price">Rs. ${item.price}</div>
                </div>
                <button class="btn-add" data-id="${item.id}">+ Add</button>
            `;
            // Securely assign element click event rather than inline string code injection
            div.querySelector(".btn-add").addEventListener("click", () => addToCart(item.id));
            listContainer.appendChild(div);
        }
    });
}

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
}

function changeQty(id, delta) {
    if (cart[id]) {
        cart[id] += delta;
        if (cart[id] <= 0) delete cart[id];
        renderCart();
    }
}

// Render Active Cart Basket Items View
function renderCart() {
    const cartContainer = document.getElementById("cartContents");
    const keys = Object.keys(cart);
    
    if (keys.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">Your shopping basket is empty. Search and add products above.</div>';
        calculateBill(0);
        return;
    }

    let html = "";
    let subtotal = 0;

    keys.forEach(id => {
        const item = medicineCatalog.find(m => m.id == id);
        const itemTotal = item.price * cart[id];
        subtotal += itemTotal;

        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong> <span style="font-size:12px; color:#666;">(${item.dose})</span>
                    <div style="font-size:13px; color:var(--brand-red); font-weight:600;">Rs. ${item.price} x ${cart[id]} = Rs. ${itemTotal}</div>
                </div>
                <div class="cart-actions">
                    <button class="qty-btn btn-minus" data-id="${id}">-</button>
                    <span style="font-weight:bold; width:20px; text-align:center;">${cart[id]}</span>
                    <button class="qty-btn btn-plus" data-id="${id}">+</button>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = html;

    // Dynamically assign functions to dynamic buttons safely
    cartContainer.querySelectorAll(".btn-minus").forEach(btn => btn.addEventListener("click", () => changeQty(btn.dataset.id, -1)));
    cartContainer.querySelectorAll(".btn-plus").forEach(btn => btn.addEventListener("click", () => changeQty(btn.dataset.id, 1)));

    calculateBill(subtotal);
}

// Process Bill Arithmetic Operations
function calculateBill(subtotal) {
    const fulfillmentType = document.querySelector('input[name="fulfillment"]:checked').value;
    let deliveryFee = 0;

    if (fulfillmentType === "Delivery") {
        document.getElementById("deliveryFeeRow").style.display = "table-row";
        deliveryFee = (subtotal >= 2000 || subtotal === 0) ? 0 : 100;
    } else {
        document.getElementById("deliveryFeeRow").style.display = "none";
        deliveryFee = 0;
    }

    let total = subtotal + deliveryFee;

    document.getElementById("subtotalVal").innerText = subtotal.toLocaleString();
    document.getElementById("deliveryVal").innerText = deliveryFee.toLocaleString();
    document.getElementById("totalVal").innerText = total.toLocaleString();

    updatePreview();
}

function handleFileAttach() {
    const fileInput = document.getElementById("prescriptionFile");
    const statusEl = document.getElementById("fileStatus");
    isPrescriptionAttached = fileInput.files.length > 0;
    statusEl.style.display = isPrescriptionAttached ? "block" : "none";
    updatePreview();
}

// Generate Raw WhatsApp Message Template Payload
function generateMessageText() {
    const name = document.getElementById("custName").value.trim() || "[Enter Name]";
    const phone = document.getElementById("custPhone").value.trim() || "[Enter Phone]";
    const fulfillment = document.querySelector('input[name="fulfillment"]:checked').value;
    const address = document.getElementById("custAddress").value.trim() || "[Enter Address]";
    const payment = document.getElementById("paymentMethod").value;
    const callback = document.getElementById("callbackToggle").checked ? "Yes, requested phone call setup" : "No, standard dispatch preferred";
    const notes = document.getElementById("orderNotes").value.trim() || "None";
    
    const subtotal = parseInt(document.getElementById("subtotalVal").innerText.replace(/,/g, '')) || 0;
    const delivery = parseInt(document.getElementById("deliveryVal").innerText.replace(/,/g, '')) || 0;
    const total = parseInt(document.getElementById("totalVal").innerText.replace(/,/g, '')) || 0;

    let text = `📦 *SHAHEEN'S PHARMACY - NEW ONLINE ORDER*\n`;
    text += `------------------------------------\n`;
    text += `👤 *Customer Profiles:*\n`;
    text += `• Name: ${name}\n`;
    text += `• Contact: ${phone}\n`;
    text += `• Type: ${fulfillment}\n`;
    if (fulfillment === "Delivery") {
        text += `• Delivery Address: ${address}\n`;
    }
    text += `• Payment Choice: ${payment}\n\n`;

    text += `🛒 *Ordered Medicines Bin:*\n`;
    let itemsFound = false;
    Object.keys(cart).forEach(id => {
        itemsFound = true;
        const item = medicineCatalog.find(m => m.id == id);
