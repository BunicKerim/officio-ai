import asyncio

class AIError(Exception):
    pass

async def safe_ai_call(call_fn, timeout=30):
    try:
        return await asyncio.wait_for(call_fn(), timeout=timeout)

    except asyncio.TimeoutError:
        raise AIError("timeout")

    except Exception as e:
        raise AIError(str(e))
