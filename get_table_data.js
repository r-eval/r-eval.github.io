function createTable(data, type, modelNames, model2url) {
    const col_size = [7, 5]
    const type_name = ['Runtime Behaviour Reasoning (Acc., %)', 'Incremental Consistency']
    const header = [['Coverage', 'State', 'Path', 'Output', 'Avg. Acc.'], ['IC Score']]
    const keys = [['coverage', 'state', 'path', 'output', 'avg_acc'], ['consistency']]
    const sort_key = [6, 1]

    const tableBox = document.createElement('div');
    tableBox.classList.add('container-fluid', 'd-flex', 'flex-column', 'align-items-center', `table-${type}`, `col-${col_size[type]}`);
    const label = document.createElement('label');
    label.classList.add('mb-3');
    label.setAttribute('for', 'plused');
    label.textContent = type_name[type];
    tableBox.appendChild(label);

    const table = document.createElement('table');
    table.setAttribute('id', 'plused');
    table.classList.add('table', 'table-responsive', 'table-striped', 'table-bordered', 'flex-shrink-1', 'border', 'border-3');

    const headerRow = document.createElement('tr');
    ['#', 'Model', ...header[type]].forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        th.style.fontWeight = 'bold';
        if (key === '#' || key === 'Model') {
            th.style.textAlign = 'left';
        }
        if (type === 0) {
            if (key !== 'Coverage') {
                th.rowSpan = 2;
            } else {
                th.colSpan = 2;
            }
        }
        headerRow.appendChild(th);
    })
    table.appendChild(headerRow);

    if (type === 0) {
        const headerRow2 = document.createElement('tr');
        ['Acc.', 'F1'].forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow2.appendChild(th);
        });
        table.appendChild(headerRow2);
    }

    const row_datas = []
    for (const modelName of modelNames) {
        const row_data = [];
        keys[type].forEach(key => {
            if (key === 'coverage') {
                ['acc', 'f1'].forEach(subkey => {
                    row_data.push(decimalToPercentage(data[modelName][key][subkey]));
                });
            } else if (key === 'consistency') {
                row_data.push(data[modelName][key].toFixed(2));
            } else {
                row_data.push(decimalToPercentage(data[modelName][key]));
            }
        });

        row_datas.push([modelName, ...row_data]);
    }

    row_datas.sort((a, b) => b[sort_key[type]] - a[sort_key[type]]);

    var rank = 0;
    const medals = ['🥇', '🥈', '🥉'];

    row_datas.forEach(item => {
        const row = document.createElement('tr');
        item.unshift(rank + 1);
        Object.values(item).forEach((value,idx) => {
            const td = document.createElement('td');
            if (idx == 1) {
                const hlink = document.createElement('a');
                if (rank < 3) {
                    hlink.textContent = `${medals[rank]} ${value}`;
                } else {
                    hlink.textContent = value;
                }
                hlink.href = model2url[value];
                td.appendChild(hlink)
            } else {
                td.textContent = value;
            }
            if (idx < 2) {
                td.style.textAlign = 'left';
            }
            row.appendChild(td);
        });
        table.appendChild(row);
        rank += 1;
    });

    tableBox.appendChild(table)

    return tableBox;
}

function appendTable(fileName, model2url) {
    fetch(fileName)
        .then(response => response.json())
        .then(data => {
            const modelNames = Object.keys(data);
            const uniqueModelNames = Array.from(new Set(modelNames));

            uniqueModelNames.forEach(modelName => {
                const metrics = data[modelName];
                const accs = [metrics['coverage']['acc'], metrics['state'], metrics['path'], metrics['output']];
                const avgAcc = accs.reduce((a, b) => a + b, 0) / accs.length;
                metrics['avg_acc'] = avgAcc;
            });

            [0, 1].forEach(type => {
                const table = createTable(data, type, uniqueModelNames, model2url);
                document.getElementById('tableContainer').appendChild(table);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayTables() {
    fetch('/model_url_map.json')
        .then(response => response.json())
        .then(data => {
            appendTable('results.json', data);
        })
}

function decimalToPercentage(number) {
    const percentage = (number * 100.0).toFixed(2);
    return parseFloat(percentage);
}

displayTables();