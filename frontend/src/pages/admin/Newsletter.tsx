import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { Loader2, Send, Mail, AlertCircle } from 'lucide-react';

export default function AdminNewsletter() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [preview, setPreview] = useState('');
  const [body, setBody] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ requested: number; sent: number; failed: string[] } | null>(null);

  const handleSend = async (isTest = false) => {
    if (!subject || !body) {
      toast({ title: 'Subject and body are required', variant: 'destructive' });
      return;
    }

    if (isTest && !testEmail) {
      toast({ title: 'Enter a test email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload: any = {
        subject,
        html_body: body,
      };
      if (preview) payload.preview_text = preview;
      if (isTest) payload.test_email = testEmail;

      const { data } = await api.post('/admin/newsletter/send', payload);
      setResult(data);
      toast({
        title: isTest ? 'Test email sent' : 'Newsletter sent',
        description: isTest
          ? `Sent test to ${testEmail}`
          : `Sent to ${data.sent} of ${data.requested} recipients`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send',
        description: error.response?.data?.detail || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            Send Newsletter
          </h1>
          <p className="text-muted-foreground">Send a campaign to all active, verified users or run a test first.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSend(true)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}Test Send
          </Button>
          <Button onClick={() => handleSend(false)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}Send Newsletter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="subject">Subject</label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., New arrivals for your workspace"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="preview">Preheader (optional)</label>
            <Input
              id="preview"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="Short preview text visible in inbox"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="body">HTML Body</label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your newsletter HTML here"
              rows={14}
            />
            <p className="text-xs text-muted-foreground">Supports HTML. Keep inline styles simple for email clients.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Send</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="test-email">Test email</label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <Button variant="outline" onClick={() => handleSend(true)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}Send Test
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Requested:</strong> {result.requested}</p>
            <p><strong>Sent:</strong> {result.sent}</p>
            {result.failed.length > 0 && (
              <div>
                <p className="text-red-600 font-medium">Failed ({result.failed.length}):</p>
                <ul className="list-disc list-inside text-red-600">
                  {result.failed.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
