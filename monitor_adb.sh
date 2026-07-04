#!/bin/bash
# Script to monitor ADB connections and capture filtered OTP login flow logs.

LOG_FILE="otp_device_logs.log"
echo "=================================================="
echo " Starting ADB Device Monitor..."
echo " Logs will be saved to: $LOG_FILE"
echo "=================================================="

# Check if adb is installed
if ! command -v adb &> /dev/null; then
    echo "Error: adb command not found. Please install Android SDK platform-tools."
    exit 1
fi

while true; do
    echo "Waiting for any Android device/emulator to connect..."
    adb wait-for-device
    
    echo "--------------------------------------------------"
    echo "Device detected!"
    echo "Device details:"
    adb devices -l
    echo "--------------------------------------------------"
    echo "Starting logcat capture. Press Ctrl+C in terminal to stop."
    echo "Filtering on: 'OTP Login Flow', 'LoginScreen', 'backend'"
    echo "--------------------------------------------------"
    
    # Run logcat filtering
    adb logcat -v time | grep -i -E "OTP Login Flow|LoginScreen|backend" | tee -a "$LOG_FILE"
    
    echo "Device disconnected or logging stopped. Retrying in 3 seconds..."
    sleep 3
done
