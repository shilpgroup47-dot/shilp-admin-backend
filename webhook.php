<?php
// Advanced GitHub Webhook Handler for Auto-Deployment and Node.js Restart
// Place this file in: public_html/webhook.php

header('Content-Type: application/json');

// Configuration - Updated for your cPanel path
$secret = 'your_webhook_secret_here'; // Set this in GitHub webhook settings
$deploy_script = '/home/shilfmfe/server_running/backend.shilpgroup.com/auto-deploy.sh';
$log_file = '/home/shilfmfe/logs/webhook.log';

// Function to log messages
function log_message($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

log_message("🎯 Webhook triggered from IP: " . $_SERVER['REMOTE_ADDR']);

// Verify request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_message("❌ Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

log_message("📦 Payload received, size: " . strlen($payload) . " bytes");

// Verify GitHub signature (if secret is set)
if (!empty($secret)) {
    $expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($signature, $expected_signature)) {
        log_message("❌ Signature verification failed");
        log_message("Expected: " . $expected_signature);
        log_message("Received: " . $signature);
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Invalid signature']);
        exit;
    }
    log_message("✅ Signature verified");
} else {
    log_message("⚠️ No secret configured - skipping signature verification");
}

// Parse payload
$data = json_decode($payload, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    log_message("❌ Invalid JSON payload: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

// Check if it's a push event to main branch
if (!isset($data['ref']) || $data['ref'] !== 'refs/heads/main') {
    log_message("ℹ️ Not a main branch push, ignoring. Ref: " . ($data['ref'] ?? 'unknown'));
    echo json_encode(['message' => 'Not a main branch push, ignoring']);
    exit;
}

// Get commit information
$commits = $data['commits'] ?? [];
$commit_messages = array_map(function($commit) {
    return $commit['message'] ?? 'Unknown';
}, $commits);

log_message("🚀 Main branch push detected!");
log_message("📝 " . count($commits) . " commit(s): " . implode('; ', array_slice($commit_messages, 0, 3)));

// Execute deployment script
log_message("⚡ Executing auto-deployment script...");

// Check if deployment script exists
if (!file_exists($deploy_script)) {
    log_message("❌ Deployment script not found: $deploy_script");
    http_response_code(500);
    echo json_encode(['error' => 'Deployment script not found']);
    exit;
}

// Make script executable
chmod($deploy_script, 0755);

// Execute deployment in background
$output = [];
$return_var = 0;

// Use exec to run script and capture output
$command = "bash $deploy_script 2>&1";
exec($command, $output, $return_var);

$output_text = implode("\n", $output);
log_message("📄 Deployment output: " . $output_text);

if ($return_var === 0) {
    log_message("✅ Auto-deployment completed successfully!");
    
    // Wait a moment for the app to start
    sleep(2);
    
    // Test if application is responding
    $health_url = 'http://localhost:8081/api/health';
    $health_check = @file_get_contents($health_url);
    
    if ($health_check !== false) {
        log_message("🔍 Health check passed - application is running");
        $response = [
            'success' => true,
            'message' => 'Deployment completed successfully',
            'commits' => count($commits),
            'health_status' => 'OK',
            'timestamp' => date('c')
        ];
    } else {
        log_message("⚠️ Health check failed - application may not be responding");
        $response = [
            'success' => true,
            'message' => 'Deployment completed but health check failed',
            'commits' => count($commits),
            'health_status' => 'UNKNOWN',
            'timestamp' => date('c')
        ];
    }
    
    echo json_encode($response);
} else {
    log_message("❌ Deployment failed with exit code: $return_var");
    http_response_code(500);
    echo json_encode([
        'error' => 'Deployment failed',
        'exit_code' => $return_var,
        'output' => $output_text,
        'timestamp' => date('c')
    ]);
}

log_message("🏁 Webhook processing completed");
?>