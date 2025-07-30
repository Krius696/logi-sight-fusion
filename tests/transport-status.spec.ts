import { test, expect } from '@playwright/test';

// Mock WebSocket server for testing
class MockWebSocketServer {
  private clients: Set<any> = new Set();

  simulate() {
    // Simulate transport update that changes status to 'verspätet'
    const transportUpdate = {
      type: 'transportUpdate',
      payload: {
        id: 'T-002',
        status: 'verspätet',
        delay: 30,
        riskScore: 65
      }
    };

    // Send to all connected clients
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(transportUpdate));
      }
    });
  }

  addClient(client: any) {
    this.clients.add(client);
  }
}

test.describe('Transport Live Tracking', () => {
  let mockWS: MockWebSocketServer;

  test.beforeEach(async ({ page }) => {
    mockWS = new MockWebSocketServer();
    
    // Mock WebSocket to use our test server
    await page.addInitScript(() => {
      class MockWebSocket {
        onopen?: () => void;
        onmessage?: (event: { data: string }) => void;
        onclose?: () => void;
        onerror?: (error: any) => void;
        readyState: number = 1; // WebSocket.OPEN

        constructor(url: string) {
          // Simulate connection
          setTimeout(() => {
            if (this.onopen) this.onopen();
          }, 100);
        }

        send(data: string) {
          // Mock send functionality
        }

        close() {
          if (this.onclose) this.onclose();
        }
      }

      (window as any).WebSocket = MockWebSocket;
    });
  });

  test('should update transport status badge when WebSocket sends update', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');

    // Wait for the transport tiles to load
    await page.waitForSelector('[data-testid="transport-tile"]', { timeout: 10000 });

    // Find transport T-002 (initially 'pünktlich')
    const transportTile = page.locator('[data-testid="transport-tile"]').filter({ hasText: 'SO-8833' });
    await expect(transportTile).toBeVisible();

    // Check initial status badge (should be green/pünktlich)
    const initialBadge = transportTile.locator('.bg-status-excellent\\/20');
    await expect(initialBadge).toBeVisible();

    // Simulate WebSocket update
    await page.evaluate(() => {
      const event = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'transportUpdate',
          payload: {
            id: 'T-002',
            status: 'verspätet',
            delay: 30,
            riskScore: 65
          }
        })
      });
      
      // Simulate WebSocket message
      const ws = (window as any).mockWebSocket;
      if (ws && ws.onmessage) {
        ws.onmessage(event);
      }
    });

    // Wait for debounced update (200ms)
    await page.waitForTimeout(300);

    // Check that the badge color changed to warning (verspätet)
    const updatedBadge = transportTile.locator('.bg-status-warning\\/20');
    await expect(updatedBadge).toBeVisible();

    // Check that delay indicator appeared
    const delayIndicator = transportTile.locator('text=+30min');
    await expect(delayIndicator).toBeVisible();

    // Check that risk score updated and shows warning color
    const riskBadge = transportTile.locator('[data-testid="risk-badge"]').filter({ hasText: '65%' });
    await expect(riskBadge).toBeVisible();
    await expect(riskBadge).toHaveClass(/bg-status-critical/);
  });

  test('should show connection status indicator', async ({ page }) => {
    await page.goto('/');

    // Check for live connection indicator
    const liveIndicator = page.locator('text=Live').first();
    await expect(liveIndicator).toBeVisible();

    // Check for WiFi icon indicating connection
    const wifiIcon = page.locator('[data-lucide="wifi"]').first();
    await expect(wifiIcon).toBeVisible();
  });

  test('should handle WebSocket disconnection gracefully', async ({ page }) => {
    await page.goto('/');

    // Simulate WebSocket disconnection
    await page.evaluate(() => {
      const ws = (window as any).mockWebSocket;
      if (ws && ws.onclose) {
        ws.onclose();
      }
    });

    // Check for offline indicator
    await expect(page.locator('text=Offline')).toBeVisible();
    
    // Check for WiFi-off icon
    const wifiOffIcon = page.locator('[data-lucide="wifi-off"]').first();
    await expect(wifiOffIcon).toBeVisible();
  });

  test('should open risk detail modal with AI analysis button', async ({ page }) => {
    await page.goto('/');

    // Wait for transport tiles to load
    await page.waitForSelector('[data-testid="transport-tile"]', { timeout: 10000 });

    // Click on a high-risk transport
    const kritischTransport = page.locator('[data-testid="transport-tile"]').filter({ hasText: 'SO-8834' });
    await kritischTransport.click();

    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check for AI analysis button
    const aiAnalysisButton = page.locator('button:has-text("Analyse starten")');
    await expect(aiAnalysisButton).toBeVisible();

    // Click AI analysis button
    await aiAnalysisButton.click();

    // Check for loading state
    await expect(page.locator('text=KI analysiert Risikofaktoren')).toBeVisible();

    // Wait for analysis to complete (mocked)
    await page.waitForTimeout(1000);

    // Check for analysis results
    await expect(page.locator('text=Ursachenanalyse')).toBeVisible();
    await expect(page.locator('text=Empfohlene Maßnahmen')).toBeVisible();
  });
});