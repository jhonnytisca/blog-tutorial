import type { Post } from "@prisma/client"
export type { Post }

import { prisma } from "~/db.server";


export async function getPosts() {
    return prisma.post.findMany()
};

export async function getPost(slug: string) {
    return prisma.post.findUnique({ where: { slug } })
}

export async function createPost(
    post: Pick<Post, "slug" | "title" | "markdown">
) {

    return prisma.post.create({ data: post })
}

export async function updatePost(
    post: Pick<Post, "slug" | "title" | "markdown">,
    slug: string
) {

    console.log("updating...")
    return prisma.post.update({
        data: post,
        where: { slug }
    })
}