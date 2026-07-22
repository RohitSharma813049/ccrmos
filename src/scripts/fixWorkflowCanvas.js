const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

const workflowSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  active: { type: Boolean, default: true },
  trigger: { type: String, required: true },
  conditions: Array,
  actions: Array,
}, { timestamps: true });

const Workflow = mongoose.models.Workflow || mongoose.model("Workflow", workflowSchema);

async function fixCanvas() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const workflows = await Workflow.find({});
    
    for (const wf of workflows) {
      const hasCanvas = wf.actions && wf.actions.find(a => a.type === "Canvas");
      if (hasCanvas) {
        console.log(`Workflow '${wf.title}' already has a canvas. Skipping.`);
        continue;
      }

      console.log(`Generating canvas for workflow '${wf.title}'...`);
      
      const nodes = [];
      const edges = [];
      let yOffset = 50;
      let prevNodeId = 'trigger-1';

      // 1. Add Trigger Node
      nodes.push({
        id: prevNodeId,
        type: 'input',
        position: { x: 250, y: yOffset },
        data: { label: `Trigger: ${wf.trigger}` },
        style: { border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px' }
      });
      yOffset += 120;

      // 2. Add Condition Nodes
      if (wf.conditions && wf.conditions.length > 0) {
        for (let i = 0; i < wf.conditions.length; i++) {
          const cond = wf.conditions[i];
          const nodeId = `condition-${i}`;
          nodes.push({
            id: nodeId,
            type: 'condition',
            position: { x: 250, y: yOffset },
            data: { id: nodeId, field: cond.field, operator: cond.operator, value: cond.value }
          });
          
          edges.push({
            id: `e-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId
          });
          
          prevNodeId = nodeId;
          yOffset += 120;
        }
      }

      // 3. Add Action Nodes
      if (wf.actions && wf.actions.length > 0) {
        for (let i = 0; i < wf.actions.length; i++) {
          const act = wf.actions[i];
          if (act.type === "Canvas") continue;

          const nodeId = `action-${i}`;
          nodes.push({
            id: nodeId,
            type: 'action',
            position: { x: 250, y: yOffset },
            data: { id: nodeId, actionType: act.type, payload: act.payload }
          });
          
          edges.push({
            id: `e-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId
          });
          
          prevNodeId = nodeId;
          yOffset += 120;
        }
      }

      // 4. Save Canvas Action
      wf.actions.push({
        type: "Canvas",
        payload: { nodes, edges }
      });

      await wf.save();
      console.log(`Saved canvas for '${wf.title}'.`);
    }

    console.log("Finished fixing workflow canvases!");
  } catch (error) {
    console.error("Error fixing canvas:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCanvas();
