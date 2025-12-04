from fastapi import APIRouter, HTTPException
from app.models.recipe import RecipeRequest, RecipeResponse
from app.services.recipe_service import RecipeService

router = APIRouter(prefix="/ai", tags=["recipes"])
recipe_service = RecipeService()

@router.post("/recipes", response_model=RecipeResponse)
async def generate_recipes(request: RecipeRequest):
    try:
        print(f"🍳 [PYTHON] Generating {len(request.items)} recipes for {request.servings} people")
        print(f"📦 [PYTHON] Available items: {[item.name for item in request.items]}")
        
        result = recipe_service.generate_recipes(request)
        
        print(f"✅ [PYTHON] Generated {len(result.recipes)} recipes successfully")
        return result
    except Exception as e:
        print(f"❌ [PYTHON] Error generating recipes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))