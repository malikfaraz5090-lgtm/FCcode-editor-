package com.farazcode.editor;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.DownloadListener;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Base64;

public class MainActivity extends BridgeActivity {
    
    private static final int PERMISSION_REQUEST_CODE = 999;
    private WebView mWebView;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize WebView
        mWebView = getBridge().getWebView();
        configureWebView();
        
        // Setup download listener
        setupDownloadManager();
        
        // Add JavaScript interface
        mWebView.addJavascriptInterface(new AppInterface(this), "AppBridge");
        
        // Request all permissions on first launch
        requestAllPermissions();
    }
    
    private void configureWebView() {
        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        mWebView.setWebViewClient(new WebViewClient());
        mWebView.setWebChromeClient(new WebChromeClient());
    }
    
    private void setupDownloadManager() {
        mWebView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, 
                                       String contentDisposition, String mimeType, 
                                       long contentLength) {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimeType);
                request.setTitle("Downloading APK");
                request.setDescription("Faraz Code Editor");
                request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS, "app-release.apk");
                
                DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(MainActivity.this, 
                        "📥 Downloading... Check notifications", Toast.LENGTH_LONG).show();
                }
            }
        });
    }
    
    // ============ PERMISSIONS SYSTEM ============
    
    private void requestAllPermissions() {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        
        // Storage permissions based on Android version
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+
            checkAndAdd(permissionsToRequest, Manifest.permission.READ_MEDIA_IMAGES);
            checkAndAdd(permissionsToRequest, Manifest.permission.READ_MEDIA_VIDEO);
            checkAndAdd(permissionsToRequest, Manifest.permission.READ_MEDIA_AUDIO);
            checkAndAdd(permissionsToRequest, Manifest.permission.POST_NOTIFICATIONS);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11-12
            checkAndAdd(permissionsToRequest, Manifest.permission.READ_EXTERNAL_STORAGE);
            checkAndAdd(permissionsToRequest, Manifest.permission.WRITE_EXTERNAL_STORAGE);
            
            // Check for MANAGE_EXTERNAL_STORAGE
            if (!Environment.isExternalStorageManager()) {
                requestManageStoragePermission();
            }
        } else {
            // Android 10 and below
            checkAndAdd(permissionsToRequest, Manifest.permission.READ_EXTERNAL_STORAGE);
            checkAndAdd(permissionsToRequest, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        }
        
        // Camera permission
        checkAndAdd(permissionsToRequest, Manifest.permission.CAMERA);
        
        // Request if needed
        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(this, 
                permissionsToRequest.toArray(new String[0]), 
                PERMISSION_REQUEST_CODE);
        }
    }
    
    private void checkAndAdd(ArrayList<String> list, String permission) {
        if (ContextCompat.checkSelfPermission(this, permission) 
            != PackageManager.PERMISSION_GRANTED) {
            list.add(permission);
        }
    }
    
    private void requestManageStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                new AlertDialog.Builder(this)
                    .setTitle("Storage Permission Required")
                    .setMessage("This app needs full storage access to save and download files.")
                    .setPositiveButton("Allow", (dialog, which) -> {
                        Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                        intent.setData(Uri.parse("package:" + getPackageName()));
                        startActivityForResult(intent, 1001);
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
            }
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, 
                                          @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (allGranted) {
                Toast.makeText(this, "✅ All permissions granted!", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "⚠️ Some permissions denied", Toast.LENGTH_SHORT).show();
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == 1001 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (Environment.isExternalStorageManager()) {
                Toast.makeText(this, "✅ Full storage access granted!", Toast.LENGTH_SHORT).show();
            }
        }
    }
    
    // ============ JAVASCRIPT INTERFACE ============
    
    public class AppInterface {
        Activity activity;
        
        AppInterface(Activity a) { activity = a; }
        
        @JavascriptInterface
        public void downloadFile(String base64Data, String fileName) {
            try {
                byte[] data = Base64.decode(base64Data, Base64.DEFAULT);
                
                File downloadsDir = Environment.getExternalStoragePublicDirectory(
                    Environment.DIRECTORY_DOWNLOADS);
                File file = new File(downloadsDir, fileName);
                
                FileOutputStream fos = new FileOutputStream(file);
                fos.write(data);
                fos.close();
                
                activity.runOnUiThread(() -> {
                    Toast.makeText(activity, 
                        "✅ Saved: " + fileName + " in Downloads", 
                        Toast.LENGTH_LONG).show();
                    
                    // Open file
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    Uri uri = androidx.core.content.FileProvider.getUriForFile(
                        activity, 
                        activity.getPackageName() + ".fileprovider", 
                        file);
                    intent.setDataAndType(uri, "application/vnd.android.package-archive");
                    intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    activity.startActivity(intent);
                });
            } catch (Exception e) {
                activity.runOnUiThread(() -> {
                    Toast.makeText(activity, 
                        "❌ Error: " + e.getMessage(), 
                        Toast.LENGTH_LONG).show();
                });
            }
        }
        
        @JavascriptInterface
        public void requestPermissions() {
            activity.runOnUiThread(() -> requestAllPermissions());
        }
        
        @JavascriptInterface
        public String getDeviceInfo() {
            return "Android " + Build.VERSION.SDK_INT + " | " + Build.MANUFACTURER + " " + Build.MODEL;
        }
    }
}
