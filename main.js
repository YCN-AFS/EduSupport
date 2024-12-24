let contentData = [];

fetchSheet
  .fetch({
    gSheetId: "1Ou0lWPoS4saNYh8stySSpJc_A3kw9WgZY8JLPWIbv9M",
    wSheetName: "Trang tính1",
  })
  .then((rows) => {
    contentData = rows;
    console.log('Loaded content data:', contentData);
  })
  .catch(error => {
    console.error('Error fetching sheet data:', error);
  });

// Thêm hàm để tìm content theo ID
function findContentById(id) {
    return contentData.find(item => item.ID === id);
}

// Export để scripts.js có thể sử dụng 
window.findContentById = findContentById;

