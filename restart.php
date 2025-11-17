<?php
// restart.php - Auto Restart Script for backend.shilpgroup.com
// Place this file in your public_html directory of backend.shilpgroup.com

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

// Security check - Allow GitHub Actions and your domain
$allowed_ips = [
    '140.82.112.0/20',  // GitHub Actions IP range
    '192.30.252.0/22',  // GitHub Actions IP range  
    '185.199.108.0/22', // GitHub Actions IP range
    '20.207.0.0/16',    // GitHub Actions additional range
];

// Allow requests from backend.shilpgroup.com domain and localhost
$allowed_hosts = [
    'backend.shilpgroup.com',
    'www.backend.shilpgroup.com',
    'localhost',
    '127.0.0.1'
];

$client_ip = $_SERVER['REMOTE_ADDR'] ?? '';
$http_host = $_SERVER['HTTP_HOST'] ?? '';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$allowed = false;

// Check if request is from allowed IP ranges, hosts, or GitHub Actions
foreach ($allowed_ips as $ip_range) {
    if (strpos($ip_range, '/') !== false) {
        if (ip_in_range($client_ip, $ip_range)) {
            $allowed = true;
            break;
        }
    } else {
        if ($client_ip === $ip_range) {
            $allowed = true;
            break;
        }
    }
}

// Check allowed hosts
if (in_array($http_host, $allowed_hosts)) {
    $allowed = true;
}

// Allow GitHub Actions specifically
if (strpos($user_agent, 'GitHub-Actions') !== false) {
    $allowed = true;
}

// Allow localhost for testing
if ($client_ip === '127.0.0.1' || $client_ip === '::1' || $client_ip === 'localhost') {
    $allowed = true;
}

if (!$allowed) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied',
        'ip' => $client_ip
    ]);
    exit;
}

// Function to check if IP is in range
function ip_in_range($ip, $range) {
    if (strpos($range, '/') == false) {
        return $ip == $range;
    }
    
    list($range, $netmask) = explode('/', $range, 2);
    $range_decimal = ip2long($range);
    $ip_decimal = ip2long($ip);
    $wildcard_decimal = pow(2, (32 - $netmask)) - 1;
    $netmask_decimal = ~ $wildcard_decimal;
    
    return (($ip_decimal & $netmask_decimal) == ($range_decimal & $netmask_decimal));
}

try {
    // Application paths
    $app_path = '/home/shilfmfe/server_running/backend.shilpgroup.com';
    $restart_script = $app_path . '/restart-app.sh';
    $log_file = '/home/shilfmfe/logs/restart.log';
    
    // Create logs directory if it doesn't exist
    $log_dir = dirname($log_file);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    // Log the restart request
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] Restart request from IP: $client_ip\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    
    // Check if restart script exists
    if (!file_exists($restart_script)) {
        throw new Exception("Restart script not found: $restart_script");
    }
    
    // Make sure script is executable
    chmod($restart_script, 0755);
    
    // Execute restart script
    $output = [];
    $return_code = 0;
    
    // Change to app directory and run restart script
    $command = "cd '$app_path' && bash '$restart_script' 2>&1";
    exec($command, $output, $return_code);
    
    $output_string = implode("\n", $output);
    
    // Log the result
    $log_entry = "[$timestamp] Restart command executed with return code: $return_code\nOutput: $output_string\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    
    if ($return_code === 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Application restarted successfully',
            'output' => $output_string,
            'timestamp' => $timestamp
        ]);
    } else {
        throw new Exception("Restart script failed with code $return_code: $output_string");
    }
    
} catch (Exception $e) {
    http_response_code(500);
    
    // Log the error
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] ERROR: " . $e->getMessage() . "\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => false,
        'message' => 'Restart failed: ' . $e->getMessage(),
        'timestamp' => $timestamp
    ]);
}
?>