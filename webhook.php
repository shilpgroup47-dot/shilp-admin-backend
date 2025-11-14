<?php
// GitHub Webhook Handler for Auto-Deployment
// Place this file in: public_html/webhook.php

// Verify GitHub webhook secret (optional but recommended)
$secret = 'your_webhook_secret_here'; // Set this in GitHub webhook settings

// Get the payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify signature (optional)
if ($secret) {
    $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($signature, $expectedSignature)) {
        http_response_code(401);
        die('Unauthorized');
    }
}

// Parse payload
$data = json_decode($payload, true);

// Check if it's a push to main branch
if ($data['ref'] === 'refs/heads/main') {
    // Log deployment
    file_put_contents('/home/username/logs/deploy.log', 
        date('Y-m-d H:i:s') . " - Deployment triggered\n", FILE_APPEND);
    
    // Execute deployment script
    $output = shell_exec('cd /home/username/public_html/api && ./deploy.sh 2>&1');
    
    // Log output
    file_put_contents('/home/username/logs/deploy.log', 
        "Output: " . $output . "\n", FILE_APPEND);
    
    echo "Deployment triggered successfully";
} else {
    echo "Not a main branch push, ignoring";
}
?>