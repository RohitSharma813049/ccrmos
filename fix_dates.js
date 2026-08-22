const fs = require('fs');
const files = [
  'src/modules/tasks/components/TasksClient.tsx',
  'src/modules/projects/components/ProjectsClient.tsx',
  'src/modules/orders/components/OrdersClient.tsx',
  'src/modules/leads/components/LeadsClient.tsx',
  'src/modules/invoices/components/InvoicesClient.tsx',
  'src/modules/customers/components/CustomersClient.tsx',
  'src/components/ui/AnalyticsCharts.tsx'
];
for(let file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/type="date"/g, 'type="datetime-local"');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
