import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePracticalStore } from '../store/practicalStore';
import { useCourseStore } from '../store/courseStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import api from '../services/api';

const PracticalUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [srNo, setSrNo] = useState('');
    const [practicalName, setPracticalName] = useState('');
    const [description, setDescription] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [courseId, setCourseId] = useState('');
    const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([]);
    const [pracIo, setPracIo] = useState<{ input: string; output: string; isPublic: boolean }[]>([]);
    const courses = useCourseStore((state) => state.courses);
    const practicals = usePracticalStore((state) => state.practicals);
    const [languages, setLanguages] = useState<any[]>([]);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await api.get('/programming-languages');
                setLanguages(response.data);
            } catch (error) {
                console.error('Failed to fetch programming languages:', error);
            }
        };
        fetchLanguages();
    }, []);

    useEffect(() => {
        const practical = practicals.find(p => p.practical_id.toString() === id);
        if (practical) {
            setSrNo(practical.sr_no.toString());
            setPracticalName(practical.practical_name);
            setDescription(practical.description);
            setPdfUrl(practical.pdf_url || '');
            setCourseId(practical.course_id.toString());
            setProgrammingLanguages(practical.prac_language.map(lang => lang.programming_language_id.toString()));
            setPracIo(practical.prac_io);
        }
    }, [practicals, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/practicals/${id}`, {
                sr_no: parseInt(srNo),
                practical_name: practicalName,
                description,
                pdf_url: pdfUrl,
                course_id: parseInt(courseId),
                prac_io: pracIo,
                prac_language: programmingLanguages.map(lang => ({ programming_language_id: parseInt(lang) }))
            });
            alert('Practical updated successfully!');
        } catch (error) {
            console.error('Failed to update practical:', error);
        }
    };

    const courseOptions = courses.map(course => ({ value: course.course_id.toString(), label: course.course_name }));
    const languageOptions = languages.map(lang => ({ value: lang.programming_language_id.toString(), label: lang.language_name }));

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Update Practical</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    label="Sr No"
                    type="number"
                    required
                    value={srNo}
                    onChange={(e) => setSrNo(e.target.value)}
                />
                <Input
                    label="Practical Name"
                    type="text"
                    required
                    value={practicalName}
                    onChange={(e) => setPracticalName(e.target.value)}
                />
                <Input
                    label="Description"
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                    label="PDF URL"
                    type="text"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                />
                <Dropdown
                    options={courseOptions}
                    onChange={(value) => setCourseId(value)}
                    placeholder="Select Course"
                />
                <Dropdown
                    options={languageOptions}
                    onChange={(value) => setProgrammingLanguages([value])}
                    placeholder="Select Programming Language"
                />
                <Button type="submit">Update Practical</Button>
            </form>
        </div>
    );
};

export default PracticalUpdate;