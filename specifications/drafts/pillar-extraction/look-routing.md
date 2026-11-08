# Lighting and materials routing: desk comparison

Status: unpublished desk review, not behavioural validation or an architecture decision. Both branches are advisory and uncalibrated; no automatic lighting or materials checks exist. The shared `look-developer` remains a reviewer, not a making workflow.

| Request | Separate entries | Combined look-development entry |
| --- | --- | --- |
| “A light sweep obscures the title in a flat animation.” | Lighting routes directly to simulated light and `TYPO-CONTRAST`; materials need not load. | The entry must recognise a lighting-only case and avoid loading surface guidance. |
| “The surface changes appearance after export; inspect its texture and normal interpretation.” | Materials routes directly to texture and interchange; lighting is context. | The entry must select the materials branch and avoid assuming a lighting change. |
| “The surface looks flat as the camera moves; revise its response and illumination.” | Both entries are relevant; coordinate surface, light, output and temporal evidence. | One entry can frame the joint iteration, then load both branches; it still needs explicit ownership. |

Separate entries have more precise discovery for focused tasks and make 2D lighting visible. A combined entry offers a single starting point for ambiguous joint look work but costs an extra routing choice and risks hiding lighting-only requests. Either approach should load the same relevant branch sections, preserve lighting's output ownership and materials' texture ownership, and hand treatments to FX. These are reasoned predictions, not observed routing or context measurements. Forward-test the three requests with independent agents and compare selection, loaded context and resulting decisions before deciding packaging.
