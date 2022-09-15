import { marked } from "marked"
import type {
    LoaderFunction,
    ActionFunction
} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
    useLoaderData,
    useActionData,
    useTransition,
    Form,
    useCatch,
    useParams
} from "@remix-run/react"
import invariant from "tiny-invariant"

import type { Post } from "~/models/post.server"
import { updatePost, getPost } from "~/models/post.server"


type ActionData =
    | {
        title: null | string
        slug: null | string
        markdown: null | string
        originalSlug: null | string
    }
    | undefined



export const action: ActionFunction = async ({
    request
}) => {

    const formData = await request.formData()

    const title = formData.get("title")
    const originalSlug = formData.get("originalSlug")
    const slug = formData.get("slug")
    const markdown = formData.get("markdown")

    const errors: ActionData = {
        title: title ? null : "Title is required",
        slug: slug ? null : "Slug is required",
        markdown: markdown ? null : "Markdown is required",
        originalSlug: originalSlug ? null : "OriginalSlug is required"
    }

    const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
    )

    if (hasErrors) {
        return json<ActionData>(errors)
    }

    invariant(
        typeof title === "string",
        "title must be a string"
    )

    invariant(
        typeof slug === "string",
        "slug must be a string"
    )

    invariant(
        typeof markdown === "string",
        "markdown must be a string"
    )

    invariant(
        typeof originalSlug === "string",
        "originalSlug must be a string"
    )

    await updatePost({ title, slug, markdown }, originalSlug)

    return redirect("/posts/admin")
}


type LoaderData = { originalPost: Post }

export const loader: LoaderFunction = async ({
    params,
}) => {
    invariant(params.slug, `params.slug is required`)

    const originalPost = await getPost(params.slug)

    if (!originalPost) {
        throw new Response('Not Found', { status: 404 })
    }

    return json<LoaderData>({ originalPost })
}

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`

export default function EditPost() {

    const { originalPost } = useLoaderData() as unknown as LoaderData
    const errors = useActionData()

    const transition = useTransition()
    const isUpdating = Boolean(transition.submission)

    return (
        <Form method="put" key={originalPost.slug}>
            <input
                hidden
                type="text"
                name="originalSlug"
                defaultValue={originalPost.slug}
            />
            <p>
                <label>
                    Post Title:{" "}
                    {errors?.title ? (
                        <em className="text-red-600">
                            {errors.title}
                        </em>
                    ) : null}
                    <input
                        type="text"
                        name="title"
                        defaultValue={originalPost.title}
                        className={inputClassName}
                    />
                </label>
            </p>
            <p>
                <label>
                    Post Slug:{" "}
                    {errors?.slug ? (
                        <em className="text-red-600">
                            {errors.slug}
                        </em>
                    ) : null}
                    <input
                        type="text"
                        name="slug"
                        defaultValue={originalPost.slug}
                        className={inputClassName}
                    />
                </label>
            </p>
            <p>
                <label htmlFor="markdown">
                    Markdown:{" "}
                    {errors?.markdown ? (
                        <em className="text-red-600">
                            {errors.markdown}
                        </em>
                    ) : null}
                </label>
                <br />
                <textarea
                    id="markdown"
                    rows={20}
                    name="markdown"
                    defaultValue={originalPost.markdown}
                    className={`${inputClassName} font-mono`}
                />
            </p>
            <p className="text-right">
                <button
                    type="submit"
                    className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                    disabled={isUpdating}
                >
                    {isUpdating ? "Updating..." : "Update Post"}
                </button>
            </p>
        </Form>
    )
}

export function CatchBoundary() {
    const caught = useCatch();
    const params = useParams();
    if (caught.status === 404) {
        return <div>Uh oh! The post "{params.slug}" does not exist. </div>
    }
    throw new Error(`Unsopported thrown response status code: ${caught.status}`)
}

export function ErrorBoundary({ error }: { error: unknown }) {
    if (error instanceof Error) {
        return (
            <div className="text-red-500">Oh no, something went wrong!
                <pre>{error.message}</pre>
            </div>
        )
    }
    return (
        <div className="text-red-500">Oh no, something went wrong!
        </div>
    )
}