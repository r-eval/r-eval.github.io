fetch('results.json')
    .then(response => response.json())
    .then(data => {
        const modelNames = Object.keys(data);
        const uniqueModelNames = Array.from(new Set(modelNames));

        uniqueModelNames.sort();

        uniqueModelNames.forEach(modelName => {
            const metrics = data[modelName];
            const accs = [metrics['coverage']['acc'], metrics['state'], metrics['path'], metrics['output']];
            const avgAcc = accs.reduce((a, b) => a + b, 0) / accs.length * 100;
            metrics['avg_acc'] = avgAcc;
        });

        const keys = ['avg_acc', 'consistency'];
        const bgColors = ['lightblue', 'lightgreen'];
        const bdColors = ['darkblue', 'darkgreen'];

        var chartData = {
            labels: uniqueModelNames,
            datasets: ['Avg. Acc. (%)', 'IC Score'].map((key, index) => {
                return {
                    yAxisID: `${index}`,
                    label: key,
                    data: uniqueModelNames.map(modelName => data[modelName][keys[index]]),
                    backgroundColor: bgColors[index],
                    borderColor: bdColors[index],
                    borderWidth: 1
                }
            }
            )
        };

        var ctx = document.getElementById('chart').getContext('2d');
        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    '0': {
                        beginAtZero: true,
                        max: 80,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Avg. Acc. (%)',
                            font: {
                                size: 20,
                                style: 'normal',
                                lineHeight: 1.2
                            },
                        }
                    },
                    '1': {
                        beginAtZero: true,
                        max: 60,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'IC Score',
                            font: {
                                size: 20,
                                style: 'normal',
                                lineHeight: 1.2
                            },
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                maintainAspectRatio: false
            }
        });
    })
    .catch(error => console.error('Error fetching JSON:', error));