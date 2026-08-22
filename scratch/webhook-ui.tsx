// scratch code for webhooks UI
export const WebhookState = `
  // Webhooks state
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
`;

export const WebhookEffect = `
    fetchWebhooks();
`;

export const WebhookMethods = `
  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/settings/webhooks");
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  const handleCreateWebhook = async () => {
    const name = prompt("Enter a name for the Webhook (e.g. 'Zapier Catch Hook'):");
    if (!name) return;
    const endpointUrl = prompt("Enter the Endpoint URL:");
    if (!endpointUrl) return;

    try {
      const res = await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, endpointUrl, events: ["*"] })
      });
      if (!res.ok) throw new Error("Failed to create webhook");
      const data = await res.json();
      setWebhooks([data.webhook, ...webhooks]);
      // Show the secret only once!
      alert(\`Webhook created! Your secret is: \n\n\${data.webhook.secret}\n\nPlease save this secret now as it will not be shown again.\`);
      toast.success("Webhook created!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      const res = await fetch(\`/api/settings/webhooks?id=\${id}\`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete webhook");
      setWebhooks(webhooks.filter(w => w._id !== id));
      toast.success("Webhook deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
`;

export const WebhookUI = `
      {activeTab === 'webhooks' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Webhooks</h3>
                <p className="text-sm text-zinc-500">Subscribe to real-time events and send JSON payloads directly to your external servers.</p>
              </div>
              <Button onClick={handleCreateWebhook} className="gap-2 shrink-0"><Plus size={16}/> Add Webhook</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Endpoint URL</th>
                    <th className="px-6 py-4 font-medium">Events</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loadingWebhooks ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading webhooks...</td></tr>
                  ) : webhooks.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No webhooks configured yet.</td></tr>
                  ) : (
                    webhooks.map(hook => (
                      <tr key={hook._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{hook.name}</td>
                        <td className="px-6 py-4">
                           <span className="text-xs text-zinc-500 max-w-[200px] truncate block" title={hook.endpointUrl}>{hook.endpointUrl}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">{hook.events.join(', ')}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(hook.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteWebhook(hook._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-2 py-1.5 rounded transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
`;
