import json, pathlib
p=pathlib.Path('lessons.json')
data=json.loads(p.read_text(encoding='utf-8'))
for key in ['LISTENING_TESTS','READING_TESTS','WRITING_TESTS','SPEAKING_TESTS']:
    arr=data.get(key, [])
    print(f'=== {key} len={len(arr)} ===')
    if arr:
        obj=arr[0]
        print('keys', list(obj.keys()))
        print('sample id/title/level', obj.get('id'), obj.get('title'), obj.get('level'))
        if 'parts' in obj:
            print('parts len', len(obj.get('parts', [])))
            print('first part keys', list(obj['parts'][0].keys()) if obj.get('parts') else None)
        if 'tasks' in obj:
            print('tasks len', len(obj.get('tasks', [])))
        if 'questions' in obj:
            print('questions len', len(obj.get('questions', [])))
