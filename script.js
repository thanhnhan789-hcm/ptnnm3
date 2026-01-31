// API URL
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Biến lưu trữ toàn bộ sản phẩm
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortState = {
    column: null,
    direction: 'asc' // 'asc' hoặc 'desc'
};

// Hàm getAll để lấy tất cả sản phẩm
async function getAll() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        throw error;
    }
}

// Hàm tìm kiếm sản phẩm theo title
function searchProducts(searchTerm) {
    filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    displayCurrentPage();
    updateResultCount(filteredProducts.length, allProducts.length);
    renderPagination();
}

// Hàm cập nhật số lượng kết quả
function updateResultCount(filtered, total) {
    const resultCount = document.getElementById('resultCount');
    if (filtered === total) {
        resultCount.textContent = `Hiển thị ${total} sản phẩm`;
    } else {
        resultCount.textContent = `Tìm thấy ${filtered} / ${total} sản phẩm`;
    }
}

// Hàm xử lý lỗi hình ảnh - hiển thị placeholder thay vì ẩn
function handleImageError(img) {
    // Thay thế bằng placeholder đẹp hơn
    img.src = 'https://via.placeholder.com/100x100/cccccc/666666?text=Image+Error';
    img.onerror = null; // Ngăn loop vô hạn
    img.classList.add('error-image');
}

// Hàm hiển thị sản phẩm lên bảng
function displayProducts(products) {
    const productBody = document.getElementById('productBody');
    productBody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');

        // Xử lý images - thử tìm hình hợp lệ
        let imageUrls = [];

        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                if (typeof img === 'string') {
                    // Xử lý chuỗi JSON
                    if (img.startsWith('["') || img.startsWith('[\'')) {
                        try {
                            const parsed = JSON.parse(img);
                            if (Array.isArray(parsed)) {
                                parsed.forEach(url => {
                                    const cleanUrl = String(url).replace(/[\[\]"']/g, '').trim();
                                    if (cleanUrl.startsWith('http')) {
                                        imageUrls.push(cleanUrl);
                                    }
                                });
                            }
                        } catch (e) {
                            const cleanUrl = img.replace(/[\[\]"']/g, '').split(',')[0].trim();
                            if (cleanUrl.startsWith('http')) {
                                imageUrls.push(cleanUrl);
                            }
                        }
                    } else {
                        // Loại bỏ ký tự đặc biệt
                        const cleanUrl = String(img).replace(/[\[\]"']/g, '').trim();
                        if (cleanUrl.startsWith('http')) {
                            imageUrls.push(cleanUrl);
                        }
                    }
                }
            });
        }

        // Tạo HTML cho tất cả hình ảnh
        let imagesHTML = '';
        if (imageUrls.length > 0) {
            imagesHTML = imageUrls.map((url, index) => `
                <img src="${url}"
                     alt="${product.title} - Image ${index + 1}"
                     class="product-image"
                     onerror="handleImageError(this)"
                     loading="lazy">
            `).join('');
        } else {
            imagesHTML = `<img src="https://via.placeholder.com/100x100/667eea/ffffff?text=No+Image"
                              alt="No Image"
                              class="product-image">`;
        }

        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <div class="image-gallery">
                    ${imagesHTML}
                </div>
            </td>
            <td class="product-name">${product.title}</td>
            <td class="product-price">$${product.price}</td>
            <td class="product-description">${product.description}</td>
            <td>
                <span class="category-name">
                    ${product.category ? product.category.name : 'N/A'}
                </span>
            </td>
        `;

        productBody.appendChild(row);
    });
}

// Hàm hiển thị thông báo lỗi
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = `Lỗi: ${message}`;
    errorDiv.style.display = 'block';
}

// Hàm ẩn loading
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
}

// Hàm hiển thị trang hiện tại
function displayCurrentPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

    displayProducts(productsToDisplay);
}

// Hàm render phân trang
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    // Cập nhật trạng thái nút Trước/Sau
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Tạo các nút số trang
    pageNumbers.innerHTML = '';

    // Hiển thị tối đa 5 trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Điều chỉnh nếu ở đầu hoặc cuối
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'page-number';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayCurrentPage();
            renderPagination();
        });
        pageNumbers.appendChild(pageBtn);
    }
}

// Hàm thay đổi số sản phẩm mỗi trang
function changeItemsPerPage(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1;
    displayCurrentPage();
    renderPagination();
}

// Hàm sắp xếp sản phẩm
function sortProducts(column) {
    // Nếu click vào cùng cột, đổi chiều sắp xếp
    if (sortState.column === column) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Nếu click vào cột khác, sắp xếp tăng dần
        sortState.column = column;
        sortState.direction = 'asc';
    }

    // Sắp xếp mảng filteredProducts
    filteredProducts.sort((a, b) => {
        let valueA, valueB;

        if (column === 'title') {
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
        } else if (column === 'price') {
            valueA = a.price;
            valueB = b.price;
        }

        if (sortState.direction === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    // Cập nhật icon sắp xếp
    updateSortIcons();

    // Hiển thị lại trang hiện tại
    currentPage = 1; // Reset về trang 1
    displayCurrentPage();
    renderPagination();
}

// Hàm cập nhật icon sắp xếp
function updateSortIcons() {
    // Reset tất cả icons
    document.querySelectorAll('.sortable .sort-icon').forEach(icon => {
        icon.textContent = '⇅';
        icon.classList.remove('active-sort');
    });

    // Cập nhật icon cho cột đang được sắp xếp
    if (sortState.column) {
        const activeHeader = document.querySelector(`[data-sort="${sortState.column}"]`);
        if (activeHeader) {
            const icon = activeHeader.querySelector('.sort-icon');
            icon.classList.add('active-sort');
            icon.textContent = sortState.direction === 'asc' ? '▲' : '▼';
        }
    }
}

// Hàm chuyển trang
function goToPage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next') {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
        }
    }
    displayCurrentPage();
    renderPagination();
}

// Hàm khởi tạo dashboard
async function initDashboard() {
    try {
        // Hiển thị loading
        document.getElementById('loading').style.display = 'block';

        // Gọi hàm getAll để lấy dữ liệu
        const products = await getAll();

        // Lưu vào biến toàn cục
        allProducts = products;
        filteredProducts = products;

        // Ẩn loading
        hideLoading();

        // Hiển thị sản phẩm với phân trang
        displayCurrentPage();
        updateResultCount(products.length, products.length);
        renderPagination();

        // Thêm event listener cho search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });

        // Thêm event listener cho items per page
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        itemsPerPageSelect.addEventListener('change', (e) => {
            changeItemsPerPage(e.target.value);
        });

        // Thêm event listener cho nút phân trang
        document.getElementById('prevPage').addEventListener('click', () => goToPage('prev'));
        document.getElementById('nextPage').addEventListener('click', () => goToPage('next'));

        // Thêm event listener cho các cột sortable
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-sort');
                sortProducts(column);
            });
            // Thêm con trỏ pointer để người dùng biết có thể click
            header.style.cursor = 'pointer';
        });

        console.log(`Đã tải ${products.length} sản phẩm thành công!`);
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// Khởi chạy khi trang web được tải
document.addEventListener('DOMContentLoaded', initDashboard);
