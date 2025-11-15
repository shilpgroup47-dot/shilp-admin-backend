<?php
// Simple webhook for cPanel auto-deployment
header('Content-Type: application/json');

$logFile = '/home/shilfmfe/logs/webhook.log';

// Create log directory if it doesn't exist
$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

function logMessage($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND | LOCK_EX);
}

// Log webhook call
logMessage("Webhook triggered from IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

try {
    // Get payload
    $input = file_get_contents('php://input');
    $payload = json_decode($input, true);
    
    // Verify it's a push to main branch
    if ($payload && isset($payload['ref']) && $payload['ref'] === 'refs/heads/main') {
        logMessage("Valid push to main branch detected");
        
        // Execute deployment script
        $deployScript = '/home/shilfmfe/server_running/backend.shilpgroup.com/auto-deploy.sh';
        
        if (file_exists($deployScript)) {
            logMessage("Executing deployment script: $deployScript");
            
            // Run deployment script in background
            $command = "bash $deployScript > /home/shilfmfe/logs/deploy.log 2>&1 &";
            exec($command);
            
            logMessage("Deployment script started successfully");
            echo json_encode(['status' => 'success', 'message' => 'Deployment started']);
        } else {
            logMessage("ERROR: Deployment script not found at $deployScript");
            echo json_encode(['status' => 'error', 'message' => 'Deployment script not found']);
        }
    } else {
        logMessage("Ignoring webhook - not a push to main branch");
        echo json_encode(['status' => 'ignored', 'message' => 'Not a push to main branch']);
    }
    
} catch (Exception $e) {
    logMessage("ERROR: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>