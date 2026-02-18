import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
    async sendDigest(to: string, newTools: any[], updatedTools: any[]) {
        if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not found. Skipping email send.");
            return;
        }

        const newToolsHtml = newTools.map(t => `<li><a href="${process.env.NEXT_PUBLIC_APP_URL}/tools/${t.id}">${t.name}</a> - ${t.category?.join(', ') || 'Uncategorized'}</li>`).join('');
        const updatedToolsHtml = updatedTools.map(t => `<li><a href="${process.env.NEXT_PUBLIC_APP_URL}/tools/${t.id}">${t.name}</a> (Score: ${t.overallScore})</li>`).join('');

        await resend.emails.send({
            from: 'Trackr <onboarding@resend.dev>',
            to,
            subject: 'Weekly Trackr Digest',
            html: `
                <h1>Your Weekly Tool Updates</h1>
                
                ${newTools.length > 0 ? `
                    <h2>🆕 New Tools Added</h2>
                    <ul>${newToolsHtml}</ul>
                ` : ''}

                ${updatedTools.length > 0 ? `
                    <h2>📈 Recently Researched</h2>
                    <ul>${updatedToolsHtml}</ul>
                ` : ''}

                <p>Login to your workspace to see more details.</p>
            `
        });
    }
};
