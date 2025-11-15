<?php
// Enhanced webhook for cPanel auto-deployment
header('Content-Type: application/json');

$logFile = '/home/shilfmfe/logs/webhook.log';
$deployScript = '/home/shilfmfe/server_running/backend.shilpgroup.com/auto-deploy.sh';

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

function restartNodeApp() {
    logMessage("Starting Node.js app restart process...");
    
    // Kill existing Node.js process
    exec("pkill -f 'node src/server.js' 2>/dev/null", $output, $result);
    logMessage("Stopped existing Node.js processes");
    
    // Navigate to app directory and start
    $commands = [
        "cd /home/shilfmfe/server_running/backend.shilpgroup.com",
        "export NODE_ENV=production",
        "export PORT=8081", 
        "nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &"
    ];
    
    $fullCommand = implode(" && ", $commands);
    exec($fullCommand, $output, $result);
    
    // Wait a moment and check if app started
    sleep(2);
    exec("pgrep -f 'node src/server.js'", $checkOutput, $checkResult);
    
    if ($checkResult === 0) {
        logMessage("✅ Node.js app restarted successfully");
        return true;
    } else {
        logMessage("❌ Failed to restart Node.js app");
        return false;
    }
}

// Log webhook call
logMessage("Webhook triggered from IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
logMessage("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));

try {
    // Get payload
    $input = file_get_contents('php://input');
    $payload = json_decode($input, true);
    
    logMessage("Received payload: " . substr($input, 0, 200) . "...");
    
    // Check if it's a valid push event
    $isValidPush = false;
    
    if ($payload) {
        // GitHub webhook format
        if (isset($payload['ref']) && $payload['ref'] === 'refs/heads/main') {
            $isValidPush = true;
            logMessage("GitHub webhook: Push to main branch detected");
        }
        // Manual trigger format
        elseif (isset($payload['repository']['name']) && $payload['repository']['name'] === 'shilp-admin-backend') {
            $isValidPush = true;
            logMessage("Manual trigger: Deployment request received");
        }
    }
    
    if ($isValidPush) {
        logMessage("Valid deployment trigger detected - starting deployment...");
        
        // Execute deployment script if it exists
        if (file_exists($deployScript)) {
            logMessage("Executing deployment script: $deployScript");
            
            // Run deployment script
            exec("bash $deployScript > /home/shilfmfe/logs/deploy.log 2>&1 &", $output, $result);
            
            // Wait a moment for deployment to start
            sleep(3);
            
            // Restart Node.js app
            $restartSuccess = restartNodeApp();
            
            if ($restartSuccess) {
                logMessage("✅ Deployment completed successfully");
                echo json_encode([
                    'status' => 'success', 
                    'message' => 'Deployment completed and app restarted',
                    'timestamp' => date('Y-m-d H:i:s')
                ]);
            } else {
                logMessage("⚠️ Deployment completed but app restart failed");
                echo json_encode([
                    'status' => 'warning', 
                    'message' => 'Deployment completed but app restart failed',
                    'timestamp' => date('Y-m-d H:i:s')
                ]);
            }
        } else {
            logMessage("⚠️ Deployment script not found, attempting direct app restart...");
            
            // If no deployment script, just restart the app
            $restartSuccess = restartNodeApp();
            
            echo json_encode([
                'status' => $restartSuccess ? 'success' : 'error',
                'message' => $restartSuccess ? 'App restarted successfully' : 'Failed to restart app',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        }
    } else {
        logMessage("Ignoring webhook - not a valid deployment trigger");
        echo json_encode([
            'status' => 'ignored', 
            'message' => 'Not a valid deployment trigger',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
} catch (Exception $e) {
    logMessage("ERROR: " . $e->getMessage());
    echo json_encode([
        'status' => 'error', 
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>