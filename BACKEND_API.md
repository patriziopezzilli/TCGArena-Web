# Backend API Endpoint

## New Endpoint Required

Create a new endpoint in the Spring Boot backend:

### `POST /api/merchants/register`

This endpoint should handle merchant registration and shop creation in a single transaction.

#### Request Body

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "displayName": "string",
  "shopName": "string",
  "address": "string",
  "city": "string",
  "zipCode": "string",
  "phone": "string",
  "description": "string (optional)"
}
```

#### Response

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "isMerchant": true
  },
  "shop": {
    "id": "string",
    "name": "string",
    "address": "string",
    "city": "string",
    "zipCode": "string",
    "phone": "string",
    "description": "string"
  },
  "token": "string (JWT)"
}
```

#### Implementation Notes

1. Create a new `MerchantRegistrationController` in `src/main/java/com/tcgarena/api/controller/`
2. Create DTOs for request/response in `src/main/java/com/tcgarena/api/dto/`
3. Use existing `UserService` and `ShopService`
4. Wrap in `@Transactional` to ensure atomicity
5. Set `isMerchant = true` when creating the user
6. Link the shop to the newly created user
7. Generate and return JWT token

#### Sample Controller Code

```java
@RestController
@RequestMapping("/api/merchants")
@RequiredArgsConstructor
public class MerchantRegistrationController {
    
    private final UserService userService;
    private final ShopService shopService;
    private final JwtService jwtService;
    
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<MerchantRegistrationResponse> registerMerchant(
            @Valid @RequestBody MerchantRegistrationRequest request) {
        
        // Create user with isMerchant = true
        User user = userService.createMerchant(request);
        
        // Create shop linked to user
        Shop shop = shopService.createShop(user.getId(), request);
        
        // Generate token
        String token = jwtService.generateToken(user);
        
        return ResponseEntity.ok(new MerchantRegistrationResponse(user, shop, token));
    }
}
```

This endpoint should be added to the backend project at:
`/Users/PATRIZIO.PEZZILLI/Documents/Personale/TCG Arena - Backend/`
