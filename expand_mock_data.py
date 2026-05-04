import re

with open('src/mockData.ts', 'r') as f:
    content = f.read()

# find all objects
objects = re.findall(r'(\{[^}]+\})', content)
dept_counts = {}

for obj in objects:
    match = re.search(r'department:\s*"([^"]+)"', obj)
    if match:
        dept = match.group(1)
        dept_counts[dept] = dept_counts.get(dept, []) + [obj]

new_objects = []
for dept, objs in dept_counts.items():
    new_objects.extend(objs)
    needed = 10 - len(objs)
    if needed > 0:
        for i in range(needed):
            base_obj = objs[i % len(objs)]
            # Modify the process name slightly to differentiate
            new_obj = re.sub(r'(process_name:\s*"[^"]+)', r'\1 - Additional Area', base_obj)
            new_objects.append(new_obj)

with open('src/mockData.ts', 'w') as f:
    f.write('export interface MockRisk {\n')
    f.write('  department: string;\n')
    f.write('  process_name: string;\n')
    f.write('  risk_description: string;\n')
    f.write('  possible_causes: string;\n')
    f.write('  root_cause: string;\n')
    f.write('  event_type: string;\n')
    f.write('  control_description: string;\n')
    f.write('  control_type: string;\n')
    f.write('  likelihood_score: number;\n')
    f.write('  impact_score: number;\n')
    f.write('  controls_rating: number;\n')
    f.write('  risk_treatment: string;\n')
    f.write('  status: string;\n')
    f.write('  action_plan: string | null;\n')
    f.write('  action_plan_deadline: string | null;\n')
    f.write('}\n\n')
    f.write('export const MOCK_RISKS: MockRisk[] = [\n')
    f.write(',\n'.join(new_objects))
    f.write('\n];\n')

