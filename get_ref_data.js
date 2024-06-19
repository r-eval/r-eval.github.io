fetch('ref.json').then(response => response.json()).then(data => {
    document.getElementById('bibtex').textContent = data.bibtex;
});
