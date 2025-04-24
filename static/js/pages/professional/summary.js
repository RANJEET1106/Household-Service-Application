
window.Chart = Chart;
export default {
    data(){
        return{
            chartData:[],
        }
    },
    async mounted() {
      await this.createChart();
      await this.createPieChart();
    },
    methods: {
      async createChart() {
        await this.fetchServiceRequestStatus()

        const ctx = this.$refs.barChart.getContext("2d");
        

        new Chart(ctx, {
          type: "bar", // Change to 'pie', 'line', etc.
          data: {
            labels: this.chartData.labels,
            datasets: [{
              label: this.chartData.label,
              data: this.chartData.data,
              backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    barPercentage: 0.1, // Decrease bar width
                    categoryPercentage: 0.0 // Decrease category spacing
                }
            }
        }
        });
      },
      async createPieChart() {
        await this.fetchServiceRequestServices()
        const ctx = this.$refs.pieChart.getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: this.chartData.labels,
                datasets: [{
                    data: this.chartData.data,
                    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },
      async fetchServiceRequestStatus() {
        try {
            const response = await fetch("/api/service-requests-status");
            if (!response.ok) throw new Error("Failed to fetch service request summary");
    
            const data = await response.json(); // Expecting an object like {pending: 5, accepted: 3, rejected: 2}
            
            this.chartData = {
                labels: Object.keys(data).map(label => label.charAt(0).toUpperCase() + label.slice(1)), // Capitalize labels
                data: Object.values(data),
                label: "Service Requests Status"
            };
        } catch (error) {
            console.error("Error fetching service request summary:", error);
        }
      },
      async fetchServiceRequestServices() {
        try {
            const response = await fetch("/api/service-requests-services");
            if (!response.ok) throw new Error("Failed to fetch service request types summary");
    
            const data = await response.json(); // Expecting an object like {pending: 5, accepted: 3, rejected: 2}
            
            this.chartData = {
                labels: Object.keys(data).map(label => label.charAt(0).toUpperCase() + label.slice(1)), // Capitalize labels
                data: Object.values(data),
                label: "Services"
            };
        } catch (error) {
            console.error("Error fetching service request types summary:", error);
        }
      }
    },
    template:`
    <div style="margin-top: 50px; display: flex; justify-content: space-around; align-items: center; width: 80%; margin: auto;">
        <div style="width: 30%; background: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 10px;">
            <canvas ref="barChart"></canvas>
        </div>
        <div style="width: 30%; background: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 10px;">
            <canvas ref="pieChart"></canvas>
        </div>
    </div>

    `
  };