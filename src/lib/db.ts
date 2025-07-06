import type { Incentive, Project, Objective, Task } from './api';

// Simulating a database with initial data
export const db = {
    incentives: [
        { id: "a1b2c3d4-0001-0001-0001-000000000001", name: "Bonus Q1 Ventas", type: "económico", value: "1000", period: "trimestral", active: true, company_id: "c1d2e3f4-0000-0000-0000-000000000000", condition_expression: {} },
        { id: "a1b2c3d4-0001-0001-0001-000000000002", name: "Días extra por rendimiento", type: "días_libres", value: "2", period: "anual", active: true, company_id: "c1d2e3f4-0000-0000-0000-000000000000", condition_expression: {} },
    ] as Incentive[],
    projects: [
        { id: "b1c2d3e4-0002-0002-0002-000000000001", name: "Rediseño Web Corporativa", description: "Modernizar la web principal de la empresa." },
        { id: "b1c2d3e4-0002-0002-0002-000000000002", name: "Campaña Marketing Q4", description: "Lanzamiento de producto para fin de año." },
    ] as Project[],
    objectives: [
        { id: "d1e2f3a4-0003-0003-0003-000000000001", title: "Desarrollar componentes UI", description: "Crear la librería de componentes en React.", type: "individual", assigned_to: "a1b2c3d4-e5f6-7890-1234-567890abcdef", project_id: "b1c2d3e4-0002-0002-0002-000000000001", is_incentivized: true, incentive_id: "a1b2c3d4-0001-0001-0001-000000000001", weight: 50, start_date: "2024-01-01", end_date: "2024-03-31" },
    ] as Objective[],
    tasks: [
        { id: "e1f2a3b4-0004-0004-0004-000000000001", title: "Diseñar botón principal", objective_id: "d1e2f3a4-0003-0003-0003-000000000001", completed: true, is_incentivized: false },
        { id: "e1f2a3b4-0004-0004-0004-000000000002", title: "Crear componente Card", objective_id: "d1e2f3a4-0003-0003-0003-000000000001", completed: false, is_incentivized: false },
    ] as Task[],
};
