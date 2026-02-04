"""Rate limit configurations for different routes"""

RATE_LIMITS = {
    # Authentication
    "auth_login": "5/minute",
    "auth_register": "3/minute",
    "auth_forgot_password": "3/hour",
    
    # Products (public)
    "products_list": "60/minute",
    "products_get": "100/minute",
    
    # Cart operations
    "cart_add": "30/minute",
    "cart_update": "30/minute",
    
    # Orders
    "orders_create": "10/minute",
    "orders_list": "30/minute",
    
    # Reviews
    "reviews_create": "5/minute",
    
    # Admin operations
    "admin_operations": "100/minute",
}
