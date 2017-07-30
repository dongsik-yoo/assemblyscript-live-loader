import React from 'react';

class Chart extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps({data}) {
        this.createTUIChart(data);
    }

    createTUIChart(data) {
        const container = document.getElementById(this.props.id);
        const options = {
            chart: {
                width: 700,
                height: 400,
                title: this.props.title
            },
            yAxis: {
                title: 'Performance (milliseconds)'
            },
            xAxis: {
                title: 'Operations'
            },
            series: {
                line: {
                    showDot: true
                }
            },
            tooltip: {
                grouped: true,
                suffix: 'ms'
            }
        };
        const theme = {
            series: {
                column: {
                    colors: ['#74807B', '#5EA393', '#A4E2C5', '#F7A655']
                },
                line: {
                    colors: ['#E05D64']
                }
            }
        };

        // For apply theme

        // tui.chart.registerTheme('myTheme', theme);
        // options.theme = 'myTheme';

        const chart = tui.chart.comboChart(container, data, options);
    }

    render() {
        return (
            <div id={this.props.id}>
            </div>
        );
    }
}

export default Chart;
