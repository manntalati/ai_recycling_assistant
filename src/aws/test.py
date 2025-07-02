'''
import requests
import base64
import json
from PIL import Image
import io
import sys

# Replace with your actual API Gateway URL
API_GATEWAY_URL = "https://zg6glpebc0.execute-api.us-east-1.amazonaws.com/prod/classify"

def detailed_size_analysis(payload):
    """Analyze the exact size breakdown of the request"""
    print("\n🔍 DETAILED SIZE ANALYSIS")
    print("=" * 40)
    
    # Convert to JSON string
    json_str = json.dumps(payload)
    json_bytes = json_str.encode('utf-8')
    
    print(f"JSON string length: {len(json_str):,} characters")
    print(f"JSON bytes length: {len(json_bytes):,} bytes")
    print(f"JSON size in MB: {len(json_bytes) / (1024*1024):.6f} MB")
    
    # Analyze base64 image specifically
    if 'image' in payload:
        img_b64 = payload['image']
        print(f"Base64 image string length: {len(img_b64):,} characters")
        print(f"Base64 image bytes: {len(img_b64.encode('utf-8')):,} bytes")
        
        # Decode to see original image size
        try:
            original_img_bytes = base64.b64decode(img_b64)
            print(f"Original image bytes: {len(original_img_bytes):,} bytes")
            print(f"Base64 overhead: {len(img_b64) - len(original_img_bytes):,} bytes")
        except Exception as e:
            print(f"Error decoding base64: {e}")
    
    # Check if there are any other large fields
    for key, value in payload.items():
        if key != 'image':
            print(f"Field '{key}': {len(str(value)):,} characters")
    
    return len(json_bytes)

def test_minimal_request():
    """Test with the absolute minimum request possible"""
    print("\n🧪 TESTING MINIMAL REQUEST")
    print("=" * 30)
    
    # Create the tiniest possible image
    img = Image.new('RGB', (1, 1), color='red')  # 1x1 pixel!
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG', quality=10)
    img_bytes = img_buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    print(f"1x1 image size: {len(img_bytes)} bytes")
    print(f"Base64 size: {len(img_base64)} characters")
    
    payload = {"image": img_base64}
    request_size = detailed_size_analysis(payload)
    
    print(f"\n📦 TOTAL REQUEST SIZE: {request_size:,} bytes ({request_size/(1024*1024):.6f} MB)")
    
    # Make the request
    headers = {'Content-Type': 'application/json'}
    
    try:
        print("\n🚀 Making API call...")
        response = requests.post(API_GATEWAY_URL, json=payload, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}...")  # Truncate long responses
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Request failed: {str(e)}")
        return False

def test_without_image():
    """Test the endpoint without any image to see if it works at all"""
    print("\n🧪 TESTING WITHOUT IMAGE")
    print("=" * 25)
    
    # Try different payload structures
    test_payloads = [
        {},  # Empty
        {"test": "hello"},  # Simple string
        {"image": ""},  # Empty image
        {"image": "dGVzdA=="},  # "test" in base64 (4 bytes)
    ]
    
    for i, payload in enumerate(test_payloads):
        print(f"\nTest {i+1}: {payload}")
        request_size = len(json.dumps(payload).encode('utf-8'))
        print(f"Size: {request_size} bytes")
        
        try:
            response = requests.post(API_GATEWAY_URL, json=payload, 
                                   headers={'Content-Type': 'application/json'}, 
                                   timeout=30)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            
            if response.status_code != 500 or "oversize body" not in response.text:
                print("✅ This payload structure works!")
                return True
                
        except Exception as e:
            print(f"Error: {str(e)}")
    
    return False

def check_api_gateway_config():
    """Check if there might be API Gateway configuration issues"""
    print("\n🔧 POTENTIAL ISSUES TO CHECK")
    print("=" * 30)
    print("1. API Gateway Integration Request Mapping:")
    print("   - Check if there's a request template that's adding extra data")
    print("   - Look for any body mapping templates")
    print("   - Verify integration type (HTTP vs AWS_PROXY)")
    
    print("\n2. Lambda Function (if using Lambda integration):")
    print("   - Check if Lambda is adding extra data to the request")
    print("   - Verify Lambda payload format version")
    print("   - Check for any request preprocessing")
    
    print("\n3. SageMaker Endpoint Configuration:")
    print("   - Check endpoint configuration for max payload size")
    print("   - Verify instance type limits")
    print("   - Check if there's any data preprocessing that duplicates data")
    
    print("\n4. API Gateway Request Size Limits:")
    print("   - Standard: 10MB for payload")
    print("   - But internal processing might have lower limits")
    print("   - Check CloudWatch logs for more details")

def inspect_request_details():
    """Create a detailed inspection of what's being sent"""
    print("\n🔍 REQUEST INSPECTION")
    print("=" * 20)
    
    # Create minimal image
    img = Image.new('RGB', (2, 2), color='blue')
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG', quality=95)
    img_bytes = img_buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    payload = {"image": img_base64}
    
    # Show exact request details
    print("Request URL:", API_GATEWAY_URL)
    print("Request Method: POST")
    print("Request Headers: {'Content-Type': 'application/json'}")
    print(f"Request Body Preview: {json.dumps(payload)[:100]}...")
    
    # Calculate exact sizes
    json_str = json.dumps(payload)
    print(f"\nExact JSON string (first 500 chars):")
    print(json_str[:500])
    print(f"\nJSON string length: {len(json_str):,} characters")
    print(f"UTF-8 encoded length: {len(json_str.encode('utf-8')):,} bytes")
    
    # Try to identify the issue
    if len(json_str.encode('utf-8')) < 1024:  # Less than 1KB
        print("\n❗ ISSUE IDENTIFIED:")
        print("The payload is tiny (<1KB) but still getting 'oversize body' error.")
        print("This suggests the issue is NOT the request size, but possibly:")
        print("1. API Gateway is adding extra data internally")
        print("2. There's a bug in the backend processing")
        print("3. The SageMaker endpoint has a very low size limit")
        print("4. There's request transformation happening")

if __name__ == "__main__":
    print("🔍 API Gateway Request Size Debugger")
    print("=" * 50)
    
    # Test 1: Absolute minimal request
    success = test_minimal_request()
    
    if not success:
        print("\n" + "="*50)
        # Test 2: Try without image
        test_without_image()
        
        print("\n" + "="*50)
        # Test 3: Detailed inspection
        inspect_request_details()
        
        print("\n" + "="*50)
        # Test 4: Show potential issues
        check_api_gateway_config()
        
        print("\n" + "="*50)
        print("🎯 NEXT STEPS:")
        print("1. Check your API Gateway configuration")
        print("2. Look at CloudWatch logs for the API Gateway and Lambda/SageMaker")
        print("3. Test the SageMaker endpoint directly (bypass API Gateway)")
        print("4. Check if there are any request transformations")
        print("5. Verify your SageMaker model's expected input format")
    else:
        print("\n✅ SUCCESS! The endpoint is working.")
'''
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import json

# Create a 224x224 test image with some visual content
img = Image.new('RGB', (224, 224), color='lightblue')
draw = ImageDraw.Draw(img)

# Add some shapes to make it look like a recyclable item
# Draw a bottle shape
draw.rectangle([80, 50, 144, 180], fill='darkblue', outline='black', width=2)
draw.ellipse([75, 45, 149, 65], fill='darkblue', outline='black', width=2)
draw.rectangle([95, 35, 129, 50], fill='gray', outline='black', width=2)

# Add some text
try:
    # Try to use default font
    draw.text((70, 190), "RECYCLE", fill='black')
except:
    # If no font available, skip text
    pass

# Convert to bytes
buffer = io.BytesIO()
img.save(buffer, format='JPEG', quality=85)
img_data = buffer.getvalue()
img_base64 = base64.b64encode(img_data).decode('utf-8')

# Create the complete test event JSON
test_event = {
    "body": json.dumps({"image": img_base64}),
    "isBase64Encoded": False
}

print("=== COPY THIS JSON FOR YOUR LAMBDA TEST ===")
print(json.dumps(test_event, indent=2))
print("\n=== OR JUST THE BASE64 STRING ===")
print(f'"{img_base64}"')
print(f"\nImage size: {len(img_data)} bytes")
print("Image dimensions: 224x224 pixels")
print("Format: JPEG")