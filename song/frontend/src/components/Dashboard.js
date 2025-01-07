import React from "react";

function Dashboard() {
    const diseases = localStorage.getItem("diseases");
    console.log(diseases);

    return (
        <div class="dashboard-container">
            <h1>이거슨 대시보드여</h1>
            <h3>현재 [{diseases}] 이런 질병에 대한 건강에 미치는 영향과 대처방법에 대한 뭐 그런 </h3>
        </div>
    );
}

export default Dashboard;