// Fungsi untuk memformat ukuran file dalam satuan byte
const formatBytes = (a, b = 2) => {
	if (!+a)
	  return "0 Bytes";
	const c = 0 > b ? 0 :b,
	  d = Math.floor(Math.log(a) / Math.log(1024));
	return `${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"][d]}`;
  }
  
  // Fungsi untuk mengekstrak URL dari teks masukan
  const extractURL = inputText => inputText.match(/(https?|http):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]/ig);
  
  // Fungsi untuk memvalidasi tautan gambar instagram
  function isValidInstagramImage(url) {
	// Ekspresi reguler untuk memeriksa format tautan gambar instagram
	const regex = /^https:\/\/www\.instagram\.com\/p\/[\w-]+\/media\/\?size=[lm]$/;
	// Mengembalikan nilai true jika tautan gambar instagram sesuai dengan ekspresi reguler, dan false jika tidak
	return regex.test(url);
  }
  
  // Mendapatkan parameter URL dari window.location.search
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const url = urlParams.get("url");
  const audio = urlParams.get("audio");
  
  // Mendapatkan elemen HTML dari dokumen
  const inputUrl = document.getElementById('url');
  const statusDiv = document.getElementById("status");
  const aFormatSelector = document.getElementById("aFormat");
  
  // Objek status untuk menampilkan pesan pada statusDiv
  const status = {
	"loading": () => {
	  statusDiv.innerHTML = '<i class="gg-loadbar-alt"></i>';
	},
	"success": (fileSize) => {
	  statusDiv.innerHTML = `<i class="gg-check"></i><br><h4>${fileSize}</h4>`;
	},
	"error": (msg) => {
	  statusDiv.innerHTML = msg;
	}
  }
  
  // Fungsi untuk memproses URL yang diberikan sebagai parameter
  function processUrl(x) {
	if (!url) return;
	inputUrl.value = extractURL(url);
	if (audio) {
	  download(x);
	  return;
	}
	download(x);
  }
  processUrl(url);
  
  // Menambahkan event listener pada form untuk mencegah submit default dan memanggil fungsi download
  document.forms[0].addEventListener("submit", event => {
	event.preventDefault();
	download(inputUrl.value);
  });
  
  // Menambahkan event listener pada aFormatSelector untuk mengubah format audio saat berubah
  aFormatSelector.addEventListener("change", () => {
	download(inputUrl.value);
  });
  
  // Fungsi untuk mengunduh file dari URL yang diberikan sebagai parameter
  async function download(x) {
	if (!x) return;
	// Menggunakan template literal untuk membuat URL API
	var api = `https://co.wuk.sh/api/json`;
	var cURL = extractURL(x);
	var url = encodeURIComponent(cURL);
  
	// Menentukan kualitas video, format audio, dan apakah hanya audio saja
	var vQuality = 1080; // ubah baris ini sesuai kebutuhan
	var isAudioOnly = false;
	var aFormat = aFormatSelector.value || null;
	if (aFormat == 'mp4') {
		isAudioOnly = false;
	} else {
		isAudioOnly = true;
	}	  
	// Mengubah nilai isAudioOnly dari string menjadi boolean
	const requestBody = {
		url: `${url}`,
		vQuality: `${vQuality}`,
		isAudioOnly: isAudioOnly, // ubah baris ini
		aFormat: `${aFormat}`
	};

  
	// Menggunakan objek requestOptions untuk menentukan metode, header, dan body dari permintaan fetch
	const requestOptions = {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	  },
	  body: JSON.stringify(requestBody),
	};
	// Menampilkan status loading pada statusDiv
	status.loading();
  
	// Menggunakan try/catch untuk menangani error yang mungkin terjadi saat mengirimkan permintaan fetch ke API dengan requestOptions
	try {
	  // Menggunakan await untuk menunggu respons dari API
	  const response = await fetch(api, requestOptions);
	  // Memeriksa apakah respons dari API berhasil atau tidak
	  if (!response.ok) {
		status.error('Network response was not ok');
	  }
	  // Menggunakan await untuk menunggu data dari API dalam format JSON
	  const data = await response.json();
	  // Memeriksa apakah data dari API mengandung status error atau redirect
	  if (data.status == 'error') {
		status.error(data.text);
		return;
	  }
	  else if (data.status == 'redirect') {
		window.open(data.url, '_blank');
		status.success('Redirected');
		return;
	  }
  
	  // Mendapatkan URL download dari data
	  const downloadUrl = data.url;
	  // Menggunakan await untuk menunggu respons dari URL download
	  const downloadResponse = await fetch(downloadUrl);
	  // Memeriksa apakah respons dari URL download berhasil atau tidak
	  if (!downloadResponse.ok) {
		status.error('File download failed');
	  }
	  // Menggunakan await untuk menunggu ukuran file dari header respons
	  const fileSize = await downloadResponse.headers.get('content-length');
	  // Menampilkan status success dan ukuran file pada statusDiv
	  status.success(formatBytes(fileSize));
  
	  // Membuat elemen link untuk mengunduh file
	  const link = document.createElement('a');
	  link.href = downloadUrl;
	  var fileExt = aFormat;
	  // Menentukan nama file dan ekstensi berdasarkan format audio dan apakah hanya audio saja
	  if (isAudioOnly) {
		link.download = `file.${fileExt}`;
	  }  else if (aFormat == 'jpg') {
		link.download = 'file.jpg';
	  } else {
		link.download = 'file.mp4';
	  }
	  // Menjalankan fungsi click pada link untuk mengunduh file
	  link.click();
	} catch (error) {
	  // Menampilkan status error dan pesan error pada statusDiv
	  status.error(error);
	}
  }